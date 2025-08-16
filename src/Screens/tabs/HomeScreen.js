import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScrollView, View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import JobCard from '../shared/JobCard';

import COLORS from '../../constants/colors';
import Feather from '@expo/vector-icons/Feather';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);
    const [userType, setUserType] = useState(null);
    const [myUserId, setMyUserId] = useState(null);


    const [recommendedJobs, setRecommendedJobs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = 1;
                const serverUrl = 'http://10.106.2.70:4000';

                const recRes = await axios.get(`${serverUrl}/api/jobs/recommend/${userId}`);
                const allRes = await axios.get(`${serverUrl}/api/jobs`);

                setRecommendedJobs(recRes.data);

            } catch (err) {
                console.error('홈탭 채용공고 로딩 실패:', err.message);

                const dummyJobs = [
                    {
                        id: '1',
                        company: 'OpenAI',
                        location: '서울',
                        title: 'React Native 개발자',
                        career: '경력 3년 이상',
                        education: '학사 이상',
                        deadline: '2025-07-01',
                    },
                    {
                        id: '2',
                        company: '카카오엔터프라이즈',
                        location: '판교',
                        title: 'AI 백엔드 엔지니어',
                        career: '신입 가능',
                        education: '무관',
                        deadline: '2025-07-05',
                    },
                ];
                setRecommendedJobs(dummyJobs);
            }
        };

        fetchData();
    }, []);




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
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                if (!myUserId) return;
                const token = await AsyncStorage.getItem('accessToken');

                try {
                    // 맞춤 채용 공고만 가져오기
                    const recommendRes = await axios.get(`${BASE_URL}/api/jobs/recommend/${myUserId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    setJobs(
                        recommendRes.data.map(job => ({ ...job, deadline: formatDate(job.deadline) }))
                    );
                } catch (err) {
                    console.error('[fetchData]', err);
                }
            };

            fetchData();
        }, [myUserId])
    );


    const renderAiJobCard = ({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)} style={styles.aiCard}>
            <View style={styles.aiCardContent}>
                <Text style={styles.company}>{item.company}</Text>
                <Text style={styles.location}>{item.location}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.infoText}>{item.career}</Text>
                <Text style={styles.infoText}>{item.education}</Text>
                <Text style={styles.deadline}>마감: {item.deadline}</Text>
            </View>
        </TouchableOpacity>
    );



    const renderItem = ({ item }) => (
        <JobCard
            job={item}
            onPress={handlePress}
            type="recent"
            isFavorite={false}
            userType={userType}
        />
    );

    return (
        <FlatList
            data={jobs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListHeaderComponent={
                <>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.searchButton}
                        onPress={() => navigation.navigate('SearchScreen')}
                    >
                        <View style={styles.searchButtonContent}>
                            <Text style={styles.searchButtonText}>Find Your Job Now</Text>
                            <Feather name="search" size={20} color={COLORS.THEMECOLOR} />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>AI 추천 채용 공고</Text>
                    <FlatList
                        data={recommendedJobs}
                        renderItem={renderAiJobCard}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginBottom: hp('3%') }}
                    />

                    <Text style={styles.sectionTitle}>맞춤 채용 공고</Text>
                </>
            }
            ListEmptyComponent={
                <Text style={{ marginTop: 20, fontSize: 16, color: 'gray' }}>
                    맞춤 채용공고가 아직 없습니다.
                </Text>
            }
            contentContainerStyle={{ paddingTop: 0 }}
            style={styles.container} // 기존 ScrollView 스타일 유지
        />
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
        backgroundColor: '#FFF',
    },
    searchButton: {
        borderColor: COLORS.THEMECOLOR,
        borderWidth: 2,
        borderRadius: 25,
        paddingVertical: 8,
        alignItems: 'center',
        marginBottom: hp('2%'),
    },
    searchButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 15,
    },
    searchButtonText: {
        fontSize: wp('3.8%'),
        fontWeight: '600',
        color: COLORS.THEMECOLOR,
    },
    sectionTitle: {
        fontSize: wp('5.5%'),
        fontWeight: 'bold',
        marginBottom: hp('1.5%'),
    },
    aiCard: {
        width: wp('50%'),
        height: wp('40'), // 정사각형
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        borderWidth: 1,
        borderColor: '#ddd',
        padding: wp('4%'),
        marginRight: wp('4%'),
        marginVertical: hp('0.8%'),
        shadowColor: '#aaa',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    generalCard: {
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        borderWidth: 1,
        borderColor: '#ddd',
        padding: wp('4%'),
        marginVertical: hp('0.8%'),
        shadowColor: '#aaa',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    cardContent: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('0.5%'),
    },
    companyLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('2%'),
    },
    company: {
        fontSize: wp('4%'),
        color: '#333',
    },
    location: {
        fontSize: wp('3.5%'),
        color: '#666',
    },
    title: {
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
        marginBottom: hp('1%'),
    },
    footer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp('2%'),
    },
    infoText: {
        fontSize: wp('3.5%'),
        color: '#666',
        marginRight: wp('3%'),
        marginBottom: hp('0.5%'),
    },
});
