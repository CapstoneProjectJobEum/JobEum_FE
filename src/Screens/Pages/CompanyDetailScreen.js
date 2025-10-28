import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { BASE_URL } from '@env';
import { FontAwesome } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import IMAGES from '../../assets/images';

export default function CompanyDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const [role, setRole] = useState(null);
    const [myUserId, setMyUserId] = useState(null);
    const [favorites, setFavorites] = useState({});
    const { companyId } = route.params || {};
    const [showOptions, setShowOptions] = useState(false);
    const scrollRef = useRef();

    const [form, setForm] = useState({
        company: '',
        companyType: '',
        companyContact: '',
        introduction: '',
        location: '',
        industry: '',
        establishedAt: '',
        employees: '',
        homepage: '',
    });

    const [jobCount, setJobCount] = useState(0);




    useEffect(() => {
        const getUserId = async () => {
            const userInfoString = await AsyncStorage.getItem('userInfo');
            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                setMyUserId(userInfo.id);
                setRole(userInfo.role);
            }
        };
        getUserId();
    }, []);

    useFocusEffect(
        useCallback(() => {
            const fetchCompanyInfo = async () => {
                try {
                    if (!companyId) return;

                    const token = await AsyncStorage.getItem('accessToken');
                    if (!token) {
                        console.log('토큰이 없습니다.');
                        return;
                    }

                    const headers = { Authorization: `Bearer ${token}` };

                    const resUser = await axios.get(
                        `${BASE_URL}/api/account-info/${companyId}`,
                        { headers }
                    );
                    const resProfile = await axios.get(
                        `${BASE_URL}/api/company-profile/${companyId}`,
                        { headers }
                    );
                    const resJobs = await axios.get(
                        `${BASE_URL}/api/jobs?companyId=${companyId}`,
                        { headers }
                    );

                    setForm({
                        company: resUser.data.company || '',
                        companyType: resProfile.data.company_type || '',
                        industry: resProfile.data.industry || '',
                        employees: resProfile.data.employees || '',
                        establishedAt: resProfile.data.established_at || '',
                        location: resProfile.data.location || '',
                        companyContact: resProfile.data.company_contact || '',
                        homepage: resProfile.data.homepage || '',
                        introduction: resProfile.data.introduction || '',
                    });

                    setJobCount(resJobs.data.length);

                    // TODO: 북마크 상태 fetch 및 setIsBookmarked 호출
                } catch (error) {
                    console.log('기업 정보 불러오기 오류:', error);
                }
            };

            fetchCompanyInfo();
        }, [companyId])
    );

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.length !== 8) return '-';
        const year = dateStr.slice(0, 4);
        const month = dateStr.slice(4, 6);
        const day = dateStr.slice(6, 8);
        return `${year}년 ${month}월 ${day}일`;
    };


    const formatPhoneNumber = (phone) => {
        if (!phone) return '-';

        const digits = phone.replace(/\D/g, '');

        // 이동전화 11자리
        if (/^01[016789]\d{8}$/.test(digits)) {
            return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }

        // 서울 02 + 7~8자리
        if (/^02\d{7,8}$/.test(digits)) {
            if (digits.length === 9) return digits.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
            if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
        }

        // 기타 지역번호 3자리 + 7~8자리
        if (/^0[3-9]\d\d{7,8}$/.test(digits)) {
            if (digits.length === 10) return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
            if (digits.length === 11) return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }

        // 8자리 특수번호 (1577, 1588 등)
        if (/^\d{8}$/.test(digits)) {
            return digits.replace(/(\d{4})(\d{4})/, '$1-$2');
        }

        return phone; // 그 외 그대로
    };


    useEffect(() => {
        const fetchFavorites = async () => {
            if (!myUserId) return;

            const token = await AsyncStorage.getItem('accessToken');
            const favs = { job: {}, company: {} };

            try {
                const jobRes = await axios.get(`${BASE_URL}/api/user-activity/${myUserId}/bookmark_job`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                jobRes.data.forEach(item => (favs.job[item.target_id] = true));

                const companyRes = await axios.get(`${BASE_URL}/api/user-activity/${myUserId}/bookmark_company`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                companyRes.data.forEach(item => (favs.company[item.target_id] = true));

                setFavorites(favs);
                await AsyncStorage.setItem('favorites', JSON.stringify(favs));
            } catch (err) {
                console.error('북마크 불러오기 실패', err);
            }
        };
        fetchFavorites();
    }, [myUserId]);

    const toggleFavorite = async (id, type) => {
        if (!myUserId) return;

        const updatedFavs = {
            ...favorites,
            [type]: { ...favorites[type], [id]: !favorites[type][id] },
        };
        setFavorites(updatedFavs);
        await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavs));

        const token = await AsyncStorage.getItem('accessToken');
        const activityType = type === 'job' ? 'bookmark_job' : 'bookmark_company';
        const isActive = updatedFavs[type][id];

        try {
            if (isActive) {
                await axios.post(
                    `${BASE_URL}/api/user-activity`,
                    { user_id: myUserId, activity_type: activityType, target_id: id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                const { data } = await axios.get(
                    `${BASE_URL}/api/user-activity/${myUserId}/${activityType}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const target = data.find((item) => item.target_id === id);
                if (target) {
                    await axios.put(
                        `${BASE_URL}/api/user-activity/${target.id}/deactivate`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                }
            }
        } catch (err) {
            console.error('북마크 토글 실패', err);
        }
    };

    const handleReportCompany = async (company) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('로그인 필요', '신고하려면 로그인이 필요합니다.');
                return;
            }

            const reason = `${company.name} 기업을 신고합니다.`;

            const response = await axios.post(
                `${BASE_URL}/api/reports`,
                {
                    target_type: 'COMPANY',
                    target_id: company.id,
                    reason: reason
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                Alert.alert('신고 완료', `${company.name} 기업이 신고되었습니다.`);
            }
        } catch (err) {
            console.error(err);
            Alert.alert('신고 실패', '문제가 발생했습니다.');
        }
    };


    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.scrollContent}
                onScroll={(e) => {
                    if (showOptions) setShowOptions(false);
                }}
                scrollEventThrottle={16}
            >
                <View style={styles.headerRow}>
                    <View style={styles.companyRow}>
                        <Text style={styles.companyName}>{form.company || '-'}</Text>



                        <TouchableOpacity
                            onPress={() => setShowOptions(prev => !prev)}
                            style={{ padding: 10, marginLeft: 0 }}
                        >
                            <Image
                                source={IMAGES.THREEDOT}
                                resizeMode="contain"
                                style={{ height: 16, width: 16 }}
                            />
                        </TouchableOpacity>

                        {showOptions && (
                            <View style={styles.popup}>
                                <TouchableOpacity onPress={() => {
                                    setShowOptions(false);
                                    handleReportCompany({
                                        id: companyId,
                                        name: form.company
                                    });
                                }}>
                                    <Text style={styles.popupItem}>신고하기</Text>
                                </TouchableOpacity>

                                {(role === 'COMPANY' && myUserId === companyId) && (
                                    <>
                                        <View style={styles.popupDivider} />
                                        <TouchableOpacity
                                            onPress={() =>
                                                navigation.reset({
                                                    index: 0,
                                                    routes: [
                                                        {
                                                            name: 'RouteScreen',
                                                            params: {
                                                                screen: 'MainTab',
                                                                params: {
                                                                    screen: 'MY',
                                                                    params: {
                                                                        screen: 'CompanyMyScreen',
                                                                        params: { selectedTab: '기업정보 설정' },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    ],
                                                })
                                            }
                                        >
                                            <Text style={styles.popupItem}>수정하기</Text>
                                        </TouchableOpacity>
                                    </>
                                )}


                            </View>
                        )}
                    </View>

                    {!(role === 'COMPANY' || role === 'ADMIN') && (
                        <TouchableOpacity
                            onPress={() => toggleFavorite(companyId, 'company')}
                            style={styles.bookmarkButton}
                        >
                            <FontAwesome
                                name={favorites.company?.[companyId] ? 'bookmark' : 'bookmark-o'}
                                size={28}
                                color={favorites.company?.[companyId] ? '#FFD700' : '#999'}
                            />
                        </TouchableOpacity>
                    )}

                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>기업 형태</Text>
                    <Text style={styles.value}>{form.companyType || '-'}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>업종</Text>
                    <Text style={styles.value}>{form.industry || '-'}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>직원 수</Text>
                    <Text style={styles.value}>{form.employees || '-'}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>설립일</Text>
                    <Text style={styles.value}>{formatDate(form.establishedAt)}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>기업 위치</Text>
                    <Text style={styles.value}>{form.location || '-'}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>기업 연락처</Text>
                    <Text style={[styles.value, styles.underline]}
                        onPress={() => form.companyContact && Linking.openURL(`tel:${form.companyContact}`)}
                    >{formatPhoneNumber(form.companyContact)}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>홈페이지</Text>
                    <Text
                        style={[styles.value, styles.underline]}
                        onPress={() => form.homepage && Linking.openURL(form.homepage)}
                    >
                        {form.homepage || '-'}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>등록 채용공고 수</Text>
                    <Text style={styles.value}>{jobCount}</Text>
                </View>

                <View style={styles.introContainer}>
                    <Text style={styles.introLabel}>기업 소개</Text>
                    <Text style={styles.introText}>{form.introduction || '-'}</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: wp('6%'),
        paddingTop: hp('3%'),
        paddingBottom: hp('20%'),
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('2%'),
    },
    companyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    companyName: {
        fontSize: wp('5%'),
        fontWeight: '700',
        color: '#222',
        marginRight: 1,
    },
    bookmarkButton: {
        padding: 8,
        marginLeft: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp('1.5%'),
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    label: {
        fontSize: wp('4.2%'),
        fontWeight: '700',
        color: '#222',
        flex: 1,
    },
    value: {
        fontSize: wp('4.2%'),
        color: '#444',
        flex: 1,
        textAlign: 'right',
    },
    underline: {
        color: COLORS.THEMECOLOR,
        textDecorationLine: 'underline',
    },
    introContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginTop: hp('2%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    introLabel: {
        fontSize: wp('4.2%'),
        fontWeight: '700',
        color: '#222',
        marginBottom: hp('1%'),
    },
    introText: {
        fontSize: wp('4%'),
        color: '#555',
        lineHeight: 22,
    },
    popup: {
        position: 'absolute',
        top: 15,
        left: 120,
        backgroundColor: 'white',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 1000,
        minWidth: 70,
    },
    popupItem: {
        fontSize: wp('3.5%'),
        paddingVertical: 5,
        color: "#333",
    },
    popupDivider: {
        height: 1,
        backgroundColor: '#ddd',
    },
});

