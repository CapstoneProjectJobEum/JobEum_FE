import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import JobCard from '../shared/JobCard';
import FilterTabSection from './FilterTabSection';

export default function RecommendScreen() {
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);
    const [favorites, setFavorites] = useState({ job: {}, company: {} });
    const [userType, setUserType] = useState(null);
    const [myUserId, setMyUserId] = useState(null);

    // 유저 정보 불러오기
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

    // 북마크 상태 불러오기
    useEffect(() => {
        const fetchFavorites = async () => {
            if (!myUserId) return;

            const token = await AsyncStorage.getItem('accessToken');
            const favs = { job: {}, company: {} };

            try {
                const jobRes = await axios.get(
                    `${BASE_URL}/api/user-activity/${myUserId}/bookmark_job`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                jobRes.data.forEach(item => (favs.job[item.target_id] = true));

                const companyRes = await axios.get(
                    `${BASE_URL}/api/user-activity/${myUserId}/bookmark_company`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                companyRes.data.forEach(item => (favs.company[item.target_id] = true));

                setFavorites(favs);
                await AsyncStorage.setItem('favorites', JSON.stringify(favs));
            } catch (err) {
                console.error('[fetchFavorites] 북마크 불러오기 실패', err);
            }
        };
        fetchFavorites();
    }, [myUserId]);

    // 북마크 토글
    const toggleFavorite = async (id, type = 'job') => {
        if (!myUserId) return;

        const updatedFavs = {
            ...favorites,
            [type]: { ...favorites[type], [id]: !favorites[type][id] },
        };
        setFavorites(updatedFavs);
        await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavs));

        const token = await AsyncStorage.getItem('accessToken');
        const activityType = type === 'job' ? 'bookmark_job' : 'bookmark_company';
        const isActive = updatedFavs[type][id];

        try {
            if (isActive) {
                await axios.post(
                    `${BASE_URL}/api/user-activity`,
                    { user_id: myUserId, activity_type: activityType, target_id: id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                const { data } = await axios.get(
                    `${BASE_URL}/api/user-activity/${myUserId}/${activityType}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const target = data.find((item) => item.target_id === id);
                if (target) {
                    await axios.put(
                        `${BASE_URL}/api/user-activity/${target.id}/deactivate`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                }
            }
        } catch (err) {
            console.error('[toggleFavorite] 북마크 토글 실패', err);
        }
    };

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

    const [selectedFilter, setSelectedFilter] = useState({
        job: [],
        region: [],
        career: [],
        education: [],
        companyType: [],
        employmentType: [],
        personalized: {}
    });


    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                if (!myUserId) return;
                const token = await AsyncStorage.getItem('accessToken');

                try {
                    const jobRes = await axios.get(
                        `${BASE_URL}/api/user-activity/${myUserId}/bookmark_job`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const favs = { job: {}, company: {} };
                    jobRes.data.forEach(item => (favs.job[item.target_id] = true));
                    setFavorites(favs);


                    let jobsRes;
                    if (Object.values(selectedFilter).some(v => Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0)) {
                        const { data } = await axios.post(`${BASE_URL}/api/category`, selectedFilter);
                        jobsRes = data;
                    } else {
                        try {
                            const { data } = await axios.get(
                                `${BASE_URL}/api/users/recommendations/${myUserId}/list`,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            jobsRes = data.recommendations;
                        } catch {
                            const { data } = await axios.get(`${BASE_URL}/api/jobs`);
                            jobsRes = data;
                        }
                    }

                    setJobs(jobsRes.map(job => ({ ...job, deadline: formatDate(job.deadline) })));
                } catch (err) {
                    console.error('[fetchData]', err);
                }
            };

            fetchData();
        }, [myUserId, selectedFilter])
    );


    const renderItem = ({ item }) => (
        <JobCard
            job={item}
            onPress={handlePress}
            type="default"
            isFavorite={favorites.job?.[item.id]}
            onToggleFavorite={() => toggleFavorite(item.id, 'job')}
            userType={userType}
        />
    );
    return (
        <>
            <FilterTabSection
                filterStorageKey='@filterState_Recommend'
                onApply={(newFilter) => setSelectedFilter(newFilter)}
            />

            <View style={styles.container}>
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingTop: 0 }}
                    ListEmptyComponent={
                        <Text style={{ marginTop: 10, fontSize: 16, color: 'gray', textAlign: 'center', fontWeight: '700' }}>
                            추천된 채용공고가 아직 없습니다.
                        </Text>
                    }
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 20,
        backgroundColor: 'white',
    },
});
