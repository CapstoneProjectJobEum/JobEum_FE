import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '@env';
import COLORS from '../../constants/colors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import JobCard from '../shared/JobCard';

export default function AppliedJobsScreen() {
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);

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
            const jobsWithFormattedDateAndStatus = res.data.map(job => ({
                ...job,
                deadline: formatDate(job.deadline),
                // 백엔드에 status가 없으면 임시로 '서류 심사중' 하드코딩
                status: job.status || '서류 심사중',
            }));
            setJobs(jobsWithFormattedDateAndStatus);
        } catch (err) {
            console.error('채용공고 로딩 실패:', err.message);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchJobs();
        }, [])
    );

    useEffect(() => {
        fetchJobs();
    }, []);

    const renderItem = ({ item }) => (
        <JobCard
            job={item}
            onPress={handlePress}
            type="applied"
        />
    );

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
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
