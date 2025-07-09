import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import JobCard from '../shared/JobCard';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function JobListScreen() {
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);
    const [favorites, setFavorites] = useState({});
    const [userType, setUserType] = useState(null);

    const toggleFavorite = (id) => {
        setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // AsyncStorage에서 userType 불러오기
    useEffect(() => {
        const fetchUserType = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('userInfo');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    setUserType(parsed.userType);
                }
            } catch (e) {
                console.error('유저정보 불러오기 실패:', e);
            }
        };
        fetchUserType();
    }, []);

    const formatDate = (rawDate) => {
        if (!rawDate || rawDate.length !== 8) return rawDate;
        const year = rawDate.slice(0, 4);
        const month = rawDate.slice(4, 6);
        const day = rawDate.slice(6, 8);
        return `${year}-${month}-${day}`;
    };

    const handlePress = (job) => {
        navigation.navigate('JobDetailScreen', { job });
    };

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/jobs`);
            const jobsWithFormattedDate = res.data.map(job => ({
                ...job,
                deadline: formatDate(job.deadline),
            }));
            setJobs(jobsWithFormattedDate);
        } catch (err) {
            console.error('채용공고 로딩 실패:', err.message);
        }
    };

    useFocusEffect(useCallback(() => { fetchJobs(); }, []));
    useEffect(() => { fetchJobs(); }, []);

    const renderItem = ({ item }) => (
        <JobCard
            job={item}
            onPress={handlePress}
            type="default"
            isFavorite={favorites[item.id]}
            onToggleFavorite={toggleFavorite}
            userType={userType} // 여기에 userType 전달
        />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={jobs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingTop: 20 }}
                ListEmptyComponent={
                    <Text style={{ marginTop: 20, fontSize: 16, color: 'gray' }}>
                        등록된 채용공고가 없습니다.
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
