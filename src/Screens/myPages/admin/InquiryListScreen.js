import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import COLORS from '../../../constants/colors';
import { BASE_URL } from '@env';

export default function InquiryListScreen() {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('알림', '로그인이 필요합니다.');
                setLoading(false);
                return;
            }

            // 관리자 전용 API 호출
            const response = await axios.get(`${BASE_URL}/api/admin/inquiries`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // DONE 상태 제외
            const filteredItems = (response.data.items || []).filter(item => item.status !== 'DONE');
            setInquiries(filteredItems);
        } catch (error) {
            Alert.alert('오류', '문의 내역 조회 중 오류가 발생했습니다.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchInquiries();
    }, []);


    useFocusEffect(
        useCallback(() => {
            fetchInquiries();
        }, [])
    );

    const toggleExpand = (index) => {
        setExpandedIndex(prev => (prev === index ? null : index));
    };

    // 백엔드 type 값을 사용자 친화적 라벨로 변환
    const mapTypeToLabel = (type) => {
        switch (type) {
            case 'SERVICE': return '서비스 이용 문의';
            case 'BUG': return '오류 신고';
            case 'PRAISE': return '서비스 칭찬';
            default: return '기타 문의';
        }
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('InquiryReportAnswerScreen', { inquiryId: item.id, source: 'inquiry' })}
            style={styles.itemContainer}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.categoryLabel}>[{mapTypeToLabel(item.type)}]</Text>
            </View>

            <Text style={styles.answer} numberOfLines={expandedIndex === index ? undefined : 3}>
                {item.content}
            </Text>

            <TouchableOpacity onPress={() => toggleExpand(index)}>
                <Text style={styles.toggleText}>
                    {expandedIndex === index ? '접기' : '더보기'}
                </Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.THEMECOLOR} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>관리자 문의내역</Text>
            <FlatList
                data={inquiries}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <Text style={{ marginTop: 10, fontSize: 16, color: 'gray', textAlign: 'center', fontWeight: '700' }}>
                        문의 내역이 없습니다.</Text>}
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
