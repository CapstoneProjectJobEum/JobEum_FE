import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import COLORS from '../../../constants/colors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { BASE_URL } from "@env";

export default function ResumeManagement() {
    const navigation = useNavigation();
    const [userId, setUserId] = useState(null);
    const [resumeList, setResumeList] = useState([]);

    useEffect(() => {
        const fetchUserId = async () => {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                setUserId(userInfo.id);
            }
        };
        fetchUserId();
    }, []);


    useFocusEffect(
        useCallback(() => {
            const fetchResumeList = async () => {
                if (!userId) return;
                try {
                    const token = await AsyncStorage.getItem('accessToken');
                    const res = await axios.get(`${BASE_URL}/api/resumes`, {
                        params: { user_id: userId },
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    console.log('이력서 목록:', res.data);
                    setResumeList(res.data);
                } catch (error) {
                    console.error('이력서 목록 불러오기 오류:', error);
                }
            };

            fetchResumeList();
        }, [userId])
    );

    const handlePress = (resume) => {
        navigation.navigate('ResumeDetailScreen', { resume });
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>생성일: {formatDate(item.createdAt)}</Text>
            {Boolean(item.isDefault) && (
                <Text style={styles.defaultLabel}>기본 이력서</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddResumeScreen')}
            >
                <Text style={styles.addButtonText}>이력서 추가하기</Text>
            </TouchableOpacity>

            <FlatList
                data={resumeList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingTop: 20 }}
                ListEmptyComponent={
                    <Text style={{ marginTop: 10, fontSize: 16, color: 'gray', textAlign: 'center', fontWeight: '700' }}>
                        등록된 이력서가 없습니다.
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
    date: {
        fontSize: wp('3.5%'),
        color: '#666',
        marginTop: 4,
    },
    defaultLabel: {
        marginTop: 6,
        fontSize: wp('3.5%'),
        color: COLORS.THEMECOLOR,
        fontWeight: 'bold',
    },
});