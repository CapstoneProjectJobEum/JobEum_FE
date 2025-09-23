import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import COLORS from "../../../constants/colors";


const statusColorMap = {
    "서류 심사중": "#4A90E2",
    "1차 합격": "#7BBF9E",
    "면접 예정": "#F4A261",
    "최종 합격": "#3CAEA3",
    "불합격": "#B5534C",
};
export default function ApplicantStatusScreen() {
    const navigation = useNavigation();
    const [myCompanyId, setMyCompanyId] = useState(null);
    const [applications, setApplications] = useState([]);
    const [sortBy, setSortBy] = useState('id'); // 'id' = 지원순, 'ai' = AI 추천순
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getUserInfo = async () => {
            const userInfoString = await AsyncStorage.getItem('userInfo');
            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                setMyCompanyId(userInfo.id);
            }
        };
        getUserInfo();
    }, []);

    // 지원순 전체 fetch
    const fetchAllApplications = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('accessToken');
        try {
            const res = await axios.get(
                // myCompanyId 값을 쿼리 파라미터로 추가
                `${BASE_URL}/api/applications/all?companyId=${myCompanyId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );


            const mapped = res.data.map(item => ({
                ...item,
                name: item.applicant_name,
                job_deadline: item.deadline,
                job_post_id: item.job_id,
            }));

            console.log(mapped)

            setApplications(groupByJobTitle(mapped));
        } catch (err) {
            console.error('전체 지원현황 불러오기 실패', err);
        } finally {
            setLoading(false);
        }
    };

    // AI 추천 fetch + 정렬
    const fetchAIRecommendationsForGroup = async (group) => {
        if (!group.data.length || !group.data[0].job_post_id) {
            return group;
        }

        const jobPostId = group.data[0].job_post_id;

        const token = await AsyncStorage.getItem('accessToken');

        try {
            const recRes = await axios.get(
                `${BASE_URL}/api/application-recommendations/${jobPostId}/list`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const aiRecs = recRes.data.recommendations || [];

            const newData = group.data.map(app => {
                const rec = aiRecs.find(r => Number(r.user_id) === Number(app.user_id));
                return { ...app, ai_score: rec ? rec.score : null };
            });

            return { ...group, data: newData };
        } catch (err) {
            console.error(`AI 추천 불러오기 실패: jobPostId ${jobPostId}`, err);
            return group;
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (myCompanyId) {
                setSortBy('id');
                fetchAllApplications();
            }
        }, [myCompanyId])
    );

    const handlePress = async (application) => {
        if (application.is_viewed === 0) {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                await axios.put(`${BASE_URL}/api/applications/view/${application.id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setApplications(prev =>
                    prev.map(group => ({
                        ...group,
                        data: group.data.map(a =>
                            a.id === application.id ? { ...a, is_viewed: 1 } : a
                        ),
                    }))
                );
            } catch (err) {
                console.error('열람 처리 실패', err);
            }
        }
        navigation.navigate('ApplicationDetailsScreen', { applicationId: application.id });
    };

    const groupByJobTitle = (data = [], sortBy = 'id') => {
        const grouped = data.reduce((acc, item) => {
            if (!acc[item.job_title]) acc[item.job_title] = [];
            acc[item.job_title].push(item);
            return acc;
        }, {});

        // title은 항상 가나다 순
        const titles = Object.keys(grouped).sort((a, b) =>
            a.localeCompare(b, 'ko', { sensitivity: 'base', numeric: true })
        );

        return titles.map(title => ({
            title,
            data: grouped[title].sort((a, b) => {
                if (sortBy === 'id') {
                    return new Date(b.applied_at) - new Date(a.applied_at);
                } else {
                    // ai_score 없는 경우 지원일로 fallback
                    const aScore = a.ai_score ?? -1;
                    const bScore = b.ai_score ?? -1;
                    if (aScore === -1 && bScore === -1) {
                        return new Date(b.applied_at) - new Date(a.applied_at);
                    }
                    return bScore - aScore;
                }
            }),
        }));
    };

    const getBadgeText = (item) => {
        return item.is_viewed === 0 ? "지원함" : item.status || "지원함";
    };

    // 토글: 지원순 ↔ AI 추천순
    const handleSortToggle = async () => {
        if (!applications.length) return;
        setLoading(true);

        if (sortBy === 'id') {
            setSortBy('ai');

            const token = await AsyncStorage.getItem('accessToken');
            let aiRecs = [];

            try {
                // myCompanyId를 사용해 전체 추천 데이터를 한 번에 가져옴
                const recRes = await axios.get(
                    `${BASE_URL}/api/application-recommendations/by-company/${myCompanyId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                aiRecs = recRes.data.recommendations || [];
            } catch (err) {
                console.error("AI 추천 전체 불러오기 실패", err);
            }

            // 기존 지원서 데이터와 AI 추천 데이터를 매핑
            const allApps = applications.flatMap(group =>
                group.data.map(app => {
                    const rec = aiRecs.find(r =>
                        Number(r.user_id) === Number(app.user_id) &&
                        Number(r.job_post_id) === Number(app.job_post_id)
                    );
                    return { ...app, ai_score: rec ? rec.score : null };
                })
            );

            setApplications(groupByJobTitle(allApps, 'ai'));

        } else {
            setSortBy('id');
            const allApps = applications.flatMap(g => g.data);
            setApplications(groupByJobTitle(allApps, 'id'));
        }

        setLoading(false);
    };

    const renderGroup = ({ item }) => (
        <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionHeader}>{item.title}</Text>
            {item.data.map(app => (
                <TouchableOpacity key={app.id} onPress={() => handlePress(app)} style={styles.card}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.title}>{app.name}님의 지원서입니다.</Text>
                        <View
                            style={[
                                styles.statusBadge,
                                {
                                    backgroundColor:
                                        getBadgeText(app) === "지원함"
                                            ? "#6c757d"
                                            : statusColorMap[app.status],
                                },
                            ]}
                        >
                            <Text style={styles.statusBadgeText}>{getBadgeText(app)}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.subtitle}>
                            지원일: {new Date(app.applied_at).toISOString().split("T")[0]}
                        </Text>
                        {app.job_deadline && (
                            <Text style={[styles.subtitle, { marginLeft: 12 }]}>
                                마감일: {new Date(app.job_deadline).toISOString().split("T")[0]}
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleSortToggle}>
                    <Text style={[styles.sortText, { height: 20, textAlignVertical: 'center' }]}>
                        {sortBy === 'id' ? '지원순' : 'AI 추천순'}
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.THEMECOLOR} style={{ marginTop: 10 }} />
            ) : (
                <FlatList
                    data={applications}
                    keyExtractor={(item) => `${item.title}-${item.data[0]?.job_post_id}`}
                    renderItem={renderGroup}
                    ListEmptyComponent={
                        <Text style={{ marginTop: 10, fontSize: 16, color: 'gray', textAlign: 'center', fontWeight: '700' }}>
                            지원자가 없습니다.
                        </Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: hp("1.5%"),
        paddingHorizontal: wp("5%"),
        backgroundColor: 'white'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    sortText: {
        fontSize: wp("3.5%"),
        color: '#808080',
        fontWeight: '700',
    },
    sectionHeader: {
        fontSize: wp('4.8%'),
        fontWeight: '700',
        color: '#222',
        marginBottom: 5,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        borderWidth: 1,
        borderColor: '#ddd',
        padding: wp('4%'),
        marginVertical: hp('0.8%'),
    },
    title: {
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: wp('3.5%'),
        color: '#666',
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statusBadge: {
        paddingHorizontal: wp('2.5%'),
        paddingVertical: hp('0.3%'),
        borderRadius: wp('2%'),
        marginBottom: hp('0.5%'),
    },
    statusBadgeText: {
        color: '#fff',
        fontSize: wp('3.2%'),
        fontWeight: '600',
    },
});
