import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Alert, ActivityIndicator, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import COLORS from '../../constants/colors';

export default function InquiryHistoryScreen() {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(false);

    // 내 문의 내역 API 호출 함수
    const fetchAllItems = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('알림', '로그인이 필요합니다.');
                setLoading(false);
                return;
            }

            const inquiriesRes = await axios.get(`${BASE_URL}/api/inquiries/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // 신고 API
            const reportsRes = await axios.get(`${BASE_URL}/api/reports/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // 두 데이터를 하나의 리스트로 합치기
            const combined = [
                ...(inquiriesRes.data.items || []).map(item => ({
                    id: item.id,
                    source: 'inquiry',
                    type: item.type,
                    content: item.content,
                    answer: item.answer,
                    created_at: item.created_at,
                })),
                ...(reportsRes.data.items || []).map(item => ({
                    id: item.id,
                    source: 'report',
                    type: item.target_type,
                    content: item.reason,
                    answer: item.answer,
                    created_at: item.created_at,
                })),
            ];

            combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setInquiries(combined);
        } catch (error) {
            Alert.alert('오류', '데이터를 불러오는 중 문제가 발생했습니다.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (item) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('알림', '로그인이 필요합니다.');
                return;
            }

            const url =
                item.source === 'inquiry'
                    ? `${BASE_URL}/api/inquiries/${item.id}`
                    : `${BASE_URL}/api/reports/${item.id}`;

            const response = await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                Alert.alert('성공', '삭제되었습니다.');
                setInquiries(prev => prev.filter(i => i.id !== item.id));
            } else {
                Alert.alert('실패', response.data.message || '삭제 실패');
            }
        } catch (error) {
            Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
            console.error(error);
        }
    };


    useEffect(() => {
        fetchAllItems();
    }, []);

    const toggleExpand = (index) => {
        setExpandedIndex(prev => (prev === index ? null : index));
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.itemContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.categoryLabel}>
                    [{mapTypeToLabel(item.type, item.source)}]
                </Text>
                <TouchableOpacity onPress={() => deleteItem(item)}>
                    <Text style={styles.deleteText}>삭제</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.answer} numberOfLines={expandedIndex === index ? undefined : 3}>
                {item.content}
            </Text>

            <Text style={styles.answerTitle}>답변</Text>
            {item.answer ? (
                <Text style={styles.answer} numberOfLines={expandedIndex === index ? undefined : 3}>
                    {item.answer}
                </Text>
            ) : (
                <Text style={styles.answerEmpty}>아직 답변이 없습니다.</Text>
            )}

            <TouchableOpacity onPress={() => toggleExpand(index)}>
                <Text style={styles.toggleText}>
                    {expandedIndex === index ? '접기' : '더보기'}
                </Text>
            </TouchableOpacity>
        </View>
    );


    const mapTypeToLabel = (type, source) => {
        if (source === 'inquiry') {
            switch (type) {
                case 'SERVICE': return '서비스 이용 문의';
                case 'BUG': return '오류 신고';
                case 'PRAISE': return '서비스 칭찬';
                default: return '기타 문의';
            }
        } else if (source === 'report') {
            switch (type) {
                case 'JOB_POST': return '채용공고 신고';
                case 'COMPANY': return '기업 신고';
                case 'USER': return '이력서 신고';
                default: return '기타 신고';
            }
        }
        return '기타';
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.THEMECOLOR} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>문의 · 신고 내역</Text>
            <FlatList
                data={inquiries}
                renderItem={renderItem}
                keyExtractor={(item) => `${item.source}_${item.id}`}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50 }}>문의 내역이 없습니다.</Text>}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: 'white',
    },
    deleteText: {
        color: '#A9A9A9',
        fontWeight: '600',
        fontSize: 14,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    itemContainer: {
        marginBottom: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    categoryLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#444',
        marginBottom: 4,
    },
    answerTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 4,
        color: '#666',
    },
    answer: {
        fontSize: 15,
        color: '#444',
    },
    answerEmpty: {
        fontSize: 15,
        fontStyle: 'italic',
        color: '#999',
    },
    toggleText: {
        color: COLORS.THEMECOLOR,
        fontSize: 14,
        marginTop: 6,
        textAlign: 'right',
    },
});
