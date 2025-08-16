import React, { useState, useCallback } from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '@env';
import JobCard from '../shared/JobCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FavoriteJobsScreen() {
    const navigation = useNavigation();
    const [userType, setUserType] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [favorites, setFavorites] = useState({});
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

    const fetchFavorites = async (userId) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const res = await axios.get(`${BASE_URL}/api/user-activity/${userId}/bookmark_job`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const favs = {};
            res.data.forEach(item => {
                if (item.status === 1) favs[item.target_id] = true;
            });
            setFavorites(favs);
            return favs;
        } catch (err) {
            console.error('[fetchFavorites] 북마크 불러오기 실패', err);
            return {};
        }
    };

    const fetchJobs = async (favs) => {
        try {
            const res = await axios.get(`${BASE_URL}/api/jobs`);
            const filtered = res.data
                .filter(job => favs[job.id])
                .map(job => ({ ...job, deadline: formatDate(job.deadline) }));
            setJobs(filtered);
        } catch (err) {
            console.error('[fetchJobs] 채용공고 로딩 실패', err.message);
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

    // myUserId가 세팅되면 북마크 + jobs fetch
    useFocusEffect(
        useCallback(() => {
            if (!myUserId) return;
            const loadFavoritesAndJobs = async () => {
                const favs = await fetchFavorites(myUserId);
                await fetchJobs(favs);
            };
            loadFavoritesAndJobs();
        }, [myUserId])
    );

    const handlePress = (job) => {
        navigation.navigate('JobDetailScreen', { job });
    };

    const renderItem = ({ item }) => (
        <JobCard
            job={item}
            onPress={handlePress}
            type="favorite"
            isFavorite={favorites[item.id]}
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
                    <Text style={{ marginTop: 20, fontSize: 16, color: 'gray', textAlign: 'center' }}>
                        등록된 스크랩 공고가 없습니다.
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
