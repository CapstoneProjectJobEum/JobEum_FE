import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';

const statusColorMap = {
    "서류 심사중": "#4A90E2",
    "1차 합격": "#7BBF9E",
    "면접 예정": "#F4A261",
    "최종 합격": "#3CAEA3",
    "불합격": "#B5534C",
};

export default function ApplicantStatusScreen() {
    const navigation = useNavigation();
    const [myUserId, setMyUserId] = useState(null);
    const [role, setRole] = useState(null);
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const getUserId = async () => {
            const userInfoString = await AsyncStorage.getItem('userInfo');
            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                setMyUserId(userInfo.id);
                setRole(userInfo.role);
            }
        };
        getUserId();
    }, []);


    const fetchAllApplications = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            const res = await axios.get(`${BASE_URL}/api/applications/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const mapped = res.data.map(item => ({
                ...item,
                name: item.applicant_name,
                job_deadline: item.deadline
            }));

            console.log('전체 지원현황:', mapped);
            setApplications(mapped);
        } catch (err) {
            console.error('전체 지원현황 불러오기 실패', err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAllApplications();
        }, [])
    );

    const handlePress = async (application) => {
        if (application.is_viewed === 0) {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                await axios.put(`${BASE_URL}/api/applications/view/${application.id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setApplications((prev) =>
                    prev.map((a) =>
                        a.id === application.id ? { ...a, is_viewed: 1 } : a
                    )
                );
            } catch (err) {
                console.error('열람 처리 실패', err);
            }
        }
        navigation.navigate('ApplicationDetailsScreen', { applicationId: application.id });
    };


    const getBadgeText = (item) => {
        if (item.is_viewed === 0) {
            return "지원함";
        }
        return item.status || "지원함";
    };


    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)} style={styles.card}>
            <View style={styles.rowBetween}>
                <Text style={styles.title}>{item.name}님의 지원서입니다.</Text>

                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor:
                                getBadgeText(item) === "지원함"
                                    ? "#6c757d"
                                    : statusColorMap[item.status],
                        },
                    ]}
                >
                    <Text style={styles.statusBadgeText}>{getBadgeText(item)}</Text>
                </View>
            </View>
            <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
                공고: {item.job_title}
            </Text>

            <View style={styles.row}>
                <Text style={styles.subtitle}>
                    지원일: {new Date(item.applied_at).toISOString().split('T')[0]}
                </Text>
                {item.job_deadline && (
                    <Text style={[styles.subtitle, { marginLeft: 12 }]}>
                        마감일: {new Date(item.job_deadline).toISOString().split('T')[0]}
                    </Text>
                )}
            </View>
        </TouchableOpacity>

    );

    return (
        <View style={styles.container}>
            <FlatList
                data={applications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingTop: 20 }}
                ListEmptyComponent={
                    <Text style={{ marginTop: 10, fontSize: 16, color: 'gray', textAlign: 'center', fontWeight: '700' }}>
                        지원자가 없습니다.
                    </Text>
                }

            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: 'white',
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
