import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFocusEffect, useRoute } from "@react-navigation/native";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import COLORS from '../../constants/colors';
import axios from 'axios';
import { BASE_URL } from '@env';
import IMAGES from '../../assets/images';

export default function CompanyDetailScreen() {
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


    const formatPhoneNumber = (phone) => {
        if (!phone) return '-';

        const digits = phone.replace(/\D/g, '');

        if (digits.length === 10) {
            return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        } else if (digits.length === 11) {
            return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }
        return phone;
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


    const handleDelete = async () => {
        Alert.alert(
            '공고 삭제',
            '정말 삭제하시겠습니까?',
            [
                {
                    text: '취소',
                    style: 'cancel',
                },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('accessToken');
                            const response = await axios.delete(`${BASE_URL}/api/jobs/${job.id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            if (response.data.success) {
                                Alert.alert('삭제 완료', '채용공고가 삭제되었습니다.');
                                navigation.goBack();
                            } else {
                                Alert.alert('삭제 실패', response.data.message || '다시 시도해 주세요.');
                            }
                        } catch (err) {
                            console.error(err);
                            Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
                        }
                    }
                }
            ],
            { cancelable: true }
        );
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
                                        id: companyId,           // route.params에서 가져온 companyId
                                        name: form.company       // form 상태에서 회사명
                                    });
                                }}>
                                    <Text style={styles.popupItem}>신고하기</Text>
                                </TouchableOpacity>

                                {(role === 'ADMIN') && (
                                    <>
                                        <View style={styles.popupDivider} />
                                        <TouchableOpacity onPress={handleDelete}>
                                            <Text style={styles.popupItem}>삭제하기</Text>
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
                            <Icon
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
                    <Text style={styles.value}>{form.establishedAt || '-'}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>회사 위치</Text>
                    <Text style={styles.value}>{form.location || '-'}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>회사 연락처</Text>
                    <Text style={styles.value}>{formatPhoneNumber(form.companyContact)}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>홈페이지</Text>
                    <Text style={[styles.value, styles.homepageValue]}>{form.homepage || '-'}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>등록 채용공고 수</Text>
                    <Text style={styles.value}>{jobCount}</Text>
                </View>

                <View style={styles.introContainer}>
                    <Text style={styles.introLabel}>회사 소개</Text>
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
    homepageValue: {
        color: COLORS.THEMECOLOR,
        textDecorationLine: 'underline',
    },
    introContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: wp('4%'),
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

