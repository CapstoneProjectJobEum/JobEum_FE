import React, { useState, useCallback } from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '@env';
import JobCard from '../shared/JobCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppliedJobsScreen() {
    const navigation = useNavigation();
    const [userType, setUserType] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState({});
    const [myUserId, setMyUserId] = useState(null);

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

    const fetchApplications = async (userId) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const res = await axios.get(`${BASE_URL}/api/user-activity/${userId}/application_status`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const apps = {};
            res.data.forEach(item => {
                if (item.status === 1) {
                    apps[item.target_id] = item.updated_at; // 지원일 저장
                }
            });

            setApplications(apps);
            return apps;
        } catch (err) {
            console.error('[fetchApplications] 지원공고 불러오기 실패', err);
            return {};
        }
    };


    const fetchJobs = async (apps) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const jobIds = Object.keys(apps);
            if (!jobIds.length) {
                setJobs([]);
                return;
            }

            const jobList = [];
            for (const id of jobIds) {
                try {
                    const res = await axios.get(`${BASE_URL}/api/jobs/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    jobList.push({
                        ...res.data,
                        deadline: formatDate(res.data.deadline),
                        appliedAt: apps[id] // 지원일 추가
                    });
                } catch (err) {
                    console.error(`[fetchJobs] 공고 ${id} 로딩 실패`, err.message);
                }
            }

            setJobs(jobList);
        } catch (err) {
            console.error('[fetchJobs] 채용공고 로딩 실패', err);
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
            const loadApplicationsAndJobs = async () => {
                const apps = await fetchApplications(myUserId);
                await fetchJobs(apps);
            };
            loadApplicationsAndJobs();
        }, [myUserId])
    );

    const handlePress = (job) => {
        navigation.navigate('JobDetailScreen', { job });
    };

    const renderItem = ({ item }) => (
        <JobCard
            job={item}
            onPress={handlePress}
            type="applied"
            isFavorite={false}
            userType={userType}
        />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={jobs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingTop: 0 }}
                ListEmptyComponent={
                    <Text style={{ marginTop: 10, fontSize: 16, color: 'gray', textAlign: 'center', fontWeight: '700' }}>
                        지원한 채용공고가 없습니다.
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
        backgroundColor: 'white',
    },
});
