import React, { useState, useCallback } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';

export default function FavoriteCompaniesScreen() {
    const navigation = useNavigation();
    const [myUserId, setMyUserId] = useState(null);
    const [favoriteCompanies, setFavoriteCompanies] = useState([]);

    // 1. 유저 정보 fetch
    const fetchUserInfo = async () => {
        const userInfoString = await AsyncStorage.getItem('userInfo');
        if (userInfoString) {
            const userInfo = JSON.parse(userInfoString);
            setMyUserId(userInfo.id);
        }
    };

    // 2. 관심 기업 ID fetch
    const fetchFavoriteCompanyIds = async (userId) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return [];
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(`${BASE_URL}/api/user-activity/${userId}/bookmark_company`, { headers });
        return res.data.filter(item => item.status === 1).map(item => item.target_id);
    };

    // 3. 각 기업 상세정보 + 채용공고 수 fetch
    const fetchCompanyDetails = async (companyIds) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return [];
        const headers = { Authorization: `Bearer ${token}` };

        const companies = [];
        for (const id of companyIds) {
            try {
                const [resUser, resProfile, resJobs] = await Promise.all([
                    axios.get(`${BASE_URL}/api/account-info/${id}`, { headers }),
                    axios.get(`${BASE_URL}/api/company-profile/${id}`, { headers }),
                    axios.get(`${BASE_URL}/api/jobs?companyId=${id}`, { headers }),
                ]);

                companies.push({
                    id,
                    company: resUser.data.company || '',
                    industry: resProfile.data.industry || '',
                    location: resProfile.data.location || '',
                    jobCount: resJobs.data.length || 0,
                });
            } catch (err) {
                console.error(`기업 ${id} 정보 불러오기 실패`, err.message);
            }
        }
        return companies;
    };

    // myUserId 세팅 후 전체 flow
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

            const loadFavoriteCompanies = async () => {
                const companyIds = await fetchFavoriteCompanyIds(myUserId);
                if (!companyIds.length) {
                    setFavoriteCompanies([]);
                    return;
                }
                const companies = await fetchCompanyDetails(companyIds);
                setFavoriteCompanies(companies);
            };

            loadFavoriteCompanies();
        }, [myUserId])
    );

    const handleCompanyPress = (company) => {
        navigation.navigate('CompanyDetailScreen', { companyId: company.id });
    };

    const renderCompanyCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleCompanyPress(item)}
            activeOpacity={0.8}
        >
            <Text style={styles.companyName} numberOfLines={1}>{item.company}</Text>
            <View style={styles.infoRow}>
                <Text style={styles.infoText}>업무: {item.industry}</Text>
                <Text style={styles.infoText}>채용공고 수: {item.jobCount}</Text>
                <Text style={styles.infoText}>위치: {item.location}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {favoriteCompanies.length === 0 ? (
                <Text style={{ marginTop: 10, fontSize: 16, color: 'gray', textAlign: 'center', fontWeight: '700' }}>
                    관심 등록한 기업이 없습니다.
                </Text>
            ) : (
                <FlatList
                    data={favoriteCompanies}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCompanyCard}
                    contentContainerStyle={{ paddingBottom: hp('5%') }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20,
        paddingHorizontal: 20
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: wp('3%'),
        borderWidth: 1,
        borderColor: '#ddd',
        padding: wp('4%'),
        marginVertical: hp('0.8%'),
        shadowColor: '#aaa',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    companyName: {
        fontSize: wp('4%'),
        fontWeight: '500',
        color: '#000',
        flexShrink: 1,
        marginBottom: hp('1.2%')
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    infoText: {
        fontSize: wp('3.8%'),
        color: '#555',
        marginRight: wp('4%'),
        marginBottom: hp('0.6%')
    },
});
