import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FlatList, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';

import AiJobCard from '../shared/AiJobCard';
import JobCard from '../shared/JobCard';

import COLORS from '../../constants/colors';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [userType, setUserType] = useState(null);
    const [myUserId, setMyUserId] = useState(null);

    // 유저 정보 가져오기
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('userInfo');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    setUserType(parsed.userType);
                    setMyUserId(parsed.id);
                }
            } catch (e) {
                console.error('유저정보 불러오기 실패:', e);
            }
        };
        fetchUserInfo();
    }, []);

    // AI 추천 공고 가져오기
    useFocusEffect(
        useCallback(() => {
            const fetchAiJobs = async () => {
                if (!myUserId) return;
                try {
                    const token = await AsyncStorage.getItem('accessToken');
                    const recRes = await axios.get(`${BASE_URL}/api/jobs/recommend/${myUserId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!recRes.data || recRes.data.length === 0) {
                        setRecommendedJobs([]);
                        return;
                    }

                    setRecommendedJobs(
                        recRes.data
                            .slice(0, 10)
                            .map(job => ({
                                ...job,
                                deadline: formatDate(job.deadline),
                            }))
                    );
                } catch (err) {
                    if (err.response?.status === 404) {
                        // 데이터 없음 → 무시
                        setRecommendedJobs([]);
                        return;
                    }
                    console.error('[fetchAiJobs] 실패:', err.response?.status || err.message);
                    setRecommendedJobs([]);
                }
            };

            fetchAiJobs();
        }, [myUserId])
    );

    // 맞춤 채용 공고 가져오기
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                if (!myUserId) return;
                const token = await AsyncStorage.getItem('accessToken');

                try {
                    const recommendRes = await axios.get(`${BASE_URL}/api/jobs/recommend/${myUserId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!recommendRes.data || recommendRes.data.length === 0) {
                        setJobs([]);
                        return;
                    }

                    setJobs(
                        recommendRes.data.map(job => ({
                            ...job,
                            deadline: formatDate(job.deadline),
                        }))
                    );
                } catch (err) {
                    if (err.response?.status === 404) {
                        // 데이터 없음 → 무시
                        setJobs([]);
                        return;
                    }
                    console.error('[fetchData] 실패:', err.response?.status || err.message);
                    setJobs([]);
                }
            };

            fetchData();
        }, [myUserId])
    );


    const formatDate = (rawDate) => {
        if (!rawDate || rawDate.length !== 8) return rawDate;
        const year = rawDate.slice(0, 4);
        const month = rawDate.slice(4, 6);
        const day = rawDate.slice(6, 8);
        return `${year}-${month}-${day}`;
    };

    const handlePress = async (job) => {
        navigation.navigate('JobDetailScreen', { job });

        if (!myUserId) return;

        try {
            const token = await AsyncStorage.getItem('accessToken');
            await axios.post(
                `${BASE_URL}/api/user-activity`,
                {
                    user_id: myUserId,
                    activity_type: 'recent_view_job',
                    target_id: job.id,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error('[handlePress] 최근 본 공고 기록 실패', err);
        }
    };

    const renderJobCard = ({ item }) => (
        <JobCard
            job={item}
            onPress={handlePress}
            type="recent"
            isFavorite={false}
            userType={userType}
        />
    );

    const renderAiJobCard = ({ item }) => (
        <AiJobCard job={item} onPress={handlePress} />
    );

    return (
        <FlatList
            data={jobs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderJobCard}
            ListHeaderComponent={
                <>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.searchButton}
                        onPress={() => navigation.navigate('SearchScreen')}
                    >
                        <View style={styles.searchButtonContent}>
                            <Text style={styles.searchButtonText}>Find Your Job Now</Text>
                            <Feather name="search" size={wp('5%')} color={COLORS.THEMECOLOR} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>AI 추천 채용 공고</Text>
                        <TouchableOpacity
                            onPress={() =>
                                navigation.reset({
                                    index: 0,
                                    routes: [
                                        {
                                            name: 'RouteScreen',
                                            params: {
                                                screen: 'MainTab',
                                                params: { screen: 'RECOMMEND' },
                                            },
                                        },
                                    ],
                                })
                            }
                            style={styles.moreButton}
                        >
                            <Text style={styles.moreText}>더보기</Text>
                            <Ionicons name="chevron-forward" size={wp('4%')} color='#808080' />
                        </TouchableOpacity>
                    </View>
                    {recommendedJobs.length > 0 ? (
                        <FlatList
                            data={recommendedJobs}
                            renderItem={renderAiJobCard}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginBottom: hp('1%') }}
                        />
                    ) : (
                        <Text style={styles.emptyText}>AI 추천 채용공고가 아직 없습니다.</Text>
                    )}

                    <Text style={styles.sectionTitle}>맞춤 채용 공고</Text>
                </>
            }
            ListEmptyComponent={
                <Text style={styles.emptyText}>맞춤 채용공고가 아직 없습니다.</Text>
            }
            contentContainerStyle={{ paddingTop: 0 }}
            style={styles.container}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
        backgroundColor: '#FFF'
    },
    searchButton: {
        borderColor: COLORS.THEMECOLOR,
        borderWidth: 2,
        borderRadius: 25,
        paddingVertical: 8,
        alignItems: 'center',
        marginBottom: hp('2%')
    },
    searchButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 15
    },
    searchButtonText: {
        fontSize: wp('3.8%'),
        fontWeight: '600',
        color: COLORS.THEMECOLOR
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('1.5%'),
    },
    moreButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    moreText: {
        fontSize: wp('3.5%'),
        color: '#808080',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: wp('5.5%'),
        fontWeight: 'bold',
        marginBottom: hp('1.5%')
    },
    emptyText: {
        fontSize: wp('4%'),
        color: 'gray',
        textAlign: 'center',
        marginVertical: hp('2%'),
        fontWeight: '700'
    },
});
