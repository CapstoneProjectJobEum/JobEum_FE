import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '@env';
import COLORS from '../../../constants/colors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import JobCard from '../../shared/JobCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function JobManagementScreen() {
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);
    const [userId, setUserId] = useState(null);
    const [userType, setUserType] = useState(null);

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
            const filteredJobs = res.data
                .filter(job => String(job.user_id) === String(userId))
                .map(job => ({
                    ...job,
                    deadline: formatDate(job.deadline),
                }));
            setJobs(filteredJobs);
        } catch (err) {
            console.error('채용공고 로딩 실패:', err.message);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchJobs();
            }
        }, [userId])
    );

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('userInfo');
                if (jsonValue != null) {
                    const userInfo = JSON.parse(jsonValue);
                    setUserId(userInfo.id);
                    setUserType(userInfo.userType);  // 여기서 userType 저장
                }
            } catch (e) {
                console.error('유저 정보 로딩 실패', e);
            }
        };
        loadUserInfo();
    }, []);

    const renderItem = ({ item }) => (
        <JobCard
            job={item}
            onPress={handlePress}
            userType={userType}
        />
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddJobScreen')}
            >
                <Text style={styles.addButtonText}>채용공고 추가하기</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingTop: 20 }}
                    ListEmptyComponent={
                        <Text style={{ marginTop: 10, fontSize: 16, color: 'gray', textAlign: 'center', fontWeight: '700' }}>
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
    addButton: {
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
