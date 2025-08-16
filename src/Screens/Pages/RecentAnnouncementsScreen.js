import React, { useState, useCallback } from 'react';
import { Text, View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '@env';
import JobCard from '../shared/JobCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RecentAnnouncementsScreen() {
    const navigation = useNavigation();
    const [userType, setUserType] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [myUserId, setMyUserId] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]); // DB에서 가져온 recent 기록 전체

    const formatDate = (rawDate) => {
        if (!rawDate || rawDate.length !== 8) return rawDate;
        const year = rawDate.slice(0, 4);
        const month = rawDate.slice(4, 6);
        const day = rawDate.slice(6, 8);
        return `${year}-${month}-${day}`;
    };

    const fetchUserInfo = async () => {
        const userInfoString = await AsyncStorage.getItem('userInfo');
        if (userInfoString) {
            const userInfo = JSON.parse(userInfoString);
            setMyUserId(userInfo.id);
            setUserType(userInfo.userType || userInfo.role);
        }
    };

    const fetchRecentJobs = async (userId) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const res = await axios.get(`${BASE_URL}/api/user-activity/${userId}/recent_view_job`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const activeActivities = res.data.filter(item => item.status === 1);
            setRecentActivities(activeActivities);

            const recentIds = activeActivities.map(item => item.target_id);

            const jobsRes = await axios.get(`${BASE_URL}/api/jobs`);
            const filtered = jobsRes.data
                .filter(job => recentIds.includes(job.id))
                .map(job => ({ ...job, deadline: formatDate(job.deadline) }));

            setJobs(filtered);
        } catch (err) {
            console.error('[fetchRecentJobs] 최근 본 공고 로딩 실패', err);
        }
    };

    // 기록 지우기 (status=0)
    const clearRecentActivities = async () => {
        if (!myUserId || recentActivities.length === 0) return;
        try {
            const token = await AsyncStorage.getItem('accessToken');
            // 각 activity의 id로 PUT 요청
            await Promise.all(
                recentActivities.map(act =>
                    axios.put(`${BASE_URL}/api/user-activity/${act.id}/deactivate`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                )
            );
            setJobs([]); // 화면에서 바로 제거
            setRecentActivities([]);
        } catch (err) {
            console.error('[clearRecentActivities] 기록 지우기 실패', err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                await fetchUserInfo();
            };
            loadData();
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            if (!myUserId) return;
            const loadRecentJobs = async () => {
                await fetchRecentJobs(myUserId);
            };
            loadRecentJobs();
        }, [myUserId])
    );

    const handlePress = (job) => {
        navigation.navigate('JobDetailScreen', { job });
    };

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
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={clearRecentActivities}>
                    <Text style={styles.clearText}>기록 지우기</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={jobs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingTop: 0 }}
                ListEmptyComponent={
                    <Text style={{ marginTop: 20, fontSize: 16, color: 'gray', textAlign: 'center' }}>
                        최근 본 채용공고가 없습니다.
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 20,
        backgroundColor: 'white'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 10
    },
    clearText: {
        fontSize: 16,
        color: '#808080'
    },
});
