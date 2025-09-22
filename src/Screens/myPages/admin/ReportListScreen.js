import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Alert, ActivityIndicator, } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import COLORS from '../../../constants/colors';

export default function ReportListScreen() {
    const navigation = useNavigation();
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('알림', '로그인이 필요합니다.');
                setLoading(false);
                return;
            }

            const response = await axios.get(`${BASE_URL}/api/admin/reports`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const filteredItems = (response.data.items || []).filter(item => item.status !== 'CLOSED');
            setReports(filteredItems);
        } catch (error) {
            Alert.alert('오류', '신고 내역 조회 중 오류가 발생했습니다.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchReports();
        }, [])
    );


    const toggleExpand = (index) => {
        setExpandedIndex(prev => (prev === index ? null : index));
    };

    const mapTypeToLabel = (type) => {
        switch (type) {
            case 'JOB_POST': return '채용공고 신고';
            case 'COMPANY': return '기업 신고';
            case 'USER': return '이력서 신고';
            default: return '기타 신고';
        }
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity
            onPress={() => {
                navigation.navigate('InquiryReportAnswerScreen', { reportId: item.id, source: 'report' });
            }}
            style={styles.itemContainer}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.categoryLabel}>[{mapTypeToLabel(item.target_type)}]</Text>
            </View>

            <Text style={styles.answer} numberOfLines={expandedIndex === index ? undefined : 3}>
                {item.reason}
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
            <Text style={styles.title}>관리자 신고 접수 내역</Text>
            <FlatList
                data={reports}
                renderItem={renderItem}
                keyExtractor={(item) => `report_${item.id}`}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <Text style={{ marginTop: 10, fontSize: 16, color: 'gray', textAlign: 'center', fontWeight: '700' }}>
                        신고 접수 내역이 없습니다.</Text>}
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
    answer: {
        fontSize: 15,
        color: '#444',
    },
    toggleText: {
        color: COLORS.THEMECOLOR,
        fontSize: 14,
        marginTop: 6,
        textAlign: 'right',
    },
});
