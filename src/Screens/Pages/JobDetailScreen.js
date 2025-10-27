import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Dimensions, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import IMAGES from '../../assets/images';
import COLORS from '../../constants/colors';
import AiSummaryModal from '../features/AiSummaryModal';

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width * 0.9;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.6;

const statusColorMap = {
    '서류 심사중': '#4A90E2',
    '1차 합격': '#7BBF9E',
    '면접 예정': '#F4A261',
    '최종 합격': '#3CAEA3',
    '불합격': '#B5534C',
};

export default function JobDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const [favorites, setFavorites] = useState({});
    const [applications, setApplications] = useState({});
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [myUserId, setMyUserId] = useState(null);
    const [role, setRole] = useState(null);
    const [currentJobId, setCurrentJobId] = useState(null);


    const scrollRef = useRef();
    const flatListRef = useRef();

    // 기존 job 객체 초기화
    const [job, setJob] = useState(route.params.job || {});
    const [resumeList, setResumeList] = useState([]);
    const [alertShown, setAlertShown] = useState(false);

    // 알림에서 넘어온 jobPostId
    const jobPostIdFromNotification = route.params.jobPostId;

    useFocusEffect(
        useCallback(() => {
            const fetchJobDetail = async () => {
                try {
                    let idToFetch = job.id || jobPostIdFromNotification;
                    if (!idToFetch) return;

                    const response = await axios.get(`${BASE_URL}/api/jobs/${idToFetch}`);
                    if (response.data) {
                        setJob(prevJob => ({ ...prevJob, ...response.data }));

                        if (response.data.status === 'inactive' && !alertShown) {
                            Alert.alert("알림", "이미 마감된 공고입니다.", [{ text: "확인" }]);
                            setAlertShown(true);
                        }
                    }
                } catch (error) {
                    console.error('공고 불러오기 실패', error);
                }
            };

            fetchJobDetail();
        }, [job.id, jobPostIdFromNotification, alertShown])
    );

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


    const onViewRef = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentImageIndex(viewableItems[0].index);
        }
    });

    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

    const imageUris = (job.images?.length > 0 ? job.images : []).map(uri => {
        if (uri.startsWith('http')) {
            if (uri.includes('localhost:4000')) {
                return uri.replace('localhost:4000', BASE_URL.replace(/^https?:\/\//, ''));
            }
            return uri;
        }
        return `${BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/'}${uri}`;
    });



    const handleDelete = async () => {
        if (!role) return;

        const url =
            role === 'ADMIN'
                ? `${BASE_URL}/api/admin/jobs/${job.id}` // admin 라우터
                : `${BASE_URL}/api/jobs/${job.id}`;      // 기업회원 라우터

        Alert.alert(
            '공고 삭제',
            '정말 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('accessToken');
                            const response = await axios.delete(url, {
                                headers: { Authorization: `Bearer ${token}` },
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
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleReportJobPost = async (job) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('로그인 필요', '신고하려면 로그인이 필요합니다.');
                return;
            }

            const reason = `${job.company} 채용공고를 신고합니다.`;

            const response = await axios.post(
                `${BASE_URL}/api/reports`,
                {
                    target_type: 'JOB_POST',
                    target_id: job.id,
                    reason: reason
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                Alert.alert('신고 완료', `${job.company} 채용공고가 신고되었습니다.`);
            }
        } catch (err) {
            console.error(err);
            Alert.alert('신고 실패', '문제가 발생했습니다.');
        }
    };

    useFocusEffect(
        useCallback(() => {
            const fetchResumeList = async () => {
                if (!myUserId) return;
                try {
                    const token = await AsyncStorage.getItem('accessToken');
                    const res = await axios.get(`${BASE_URL}/api/resumes`, {
                        params: { user_id: myUserId },
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    const resumes = res.data;
                    setResumeList(resumes);

                    const defaultResume = resumes.find(r => r.isDefault === 1);
                    console.log('기본 이력서 ID:', defaultResume?.id || null);
                } catch (error) {
                    console.error('이력서 목록 불러오기 오류:', error);
                }
            };

            fetchResumeList();
        }, [myUserId])
    );

    useEffect(() => {
        const fetchApplications = async () => {
            if (!myUserId) return;

            const token = await AsyncStorage.getItem('accessToken');
            const apps = {};

            try {
                const res = await axios.get(
                    `${BASE_URL}/api/user-activity/${myUserId}/application_status`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                res.data.forEach(item => (apps[item.target_id] = true));
                setApplications(apps);
                await AsyncStorage.setItem('applications', JSON.stringify(apps));
            } catch (err) {
                console.error('지원현황 불러오기 실패', err);
            }
        };

        fetchApplications();
    }, [myUserId]);

    // 지원 토글: user-activity + applications
    const toggleApplication = async (jobId) => {
        if (!myUserId) return;

        const token = await AsyncStorage.getItem('accessToken');
        const defaultResumeId = resumeList.find(r => r.isDefault === 1)?.id;
        if (!defaultResumeId) {
            Alert.alert('알림', '기본 이력서가 없습니다. 이력서를 등록하거나 기본 이력서를 설정해주세요.');
            return;
        }

        try {
            // 현재 applications 라우터 데이터 가져오기 (is_viewed 확인)
            const resApp = await axios.get(
                `${BASE_URL}/api/applications/my-applications/${myUserId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const targetApp = resApp.data.find(a => a.job_id === jobId && a.resume_id === defaultResumeId);

            // is_viewed가 1이면 취소 불가 → 그냥 종료
            if (targetApp?.is_viewed === 1) {
                console.warn('기업이 열람한 지원서는 취소할 수 없습니다.');
                return;
            }

            // 로컬 상태 토글
            const updatedApps = { ...applications, [jobId]: !applications[jobId] };
            setApplications(updatedApps);
            await AsyncStorage.setItem('applications', JSON.stringify(updatedApps));
            const isActive = updatedApps[jobId];

            // 1. user-activity 처리
            const { data: uaData } = await axios.get(
                `${BASE_URL}/api/user-activity/${myUserId}/application_status`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const targetUA = uaData.find(item => item.target_id === jobId);

            if (isActive) {
                if (!targetUA) {
                    await axios.post(
                        `${BASE_URL}/api/user-activity`,
                        { user_id: myUserId, activity_type: 'application_status', target_id: jobId },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                }
            } else if (targetUA) {
                await axios.put(
                    `${BASE_URL}/api/user-activity/${targetUA.id}/deactivate`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            // 2. applications 처리
            if (targetApp) {
                if (!isActive) {
                    await axios.delete(
                        `${BASE_URL}/api/applications/cancel/${targetApp.id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                }


                await axios.delete(
                    `${BASE_URL}/api/notifications/cancel-by-job/${jobId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

            } else if (isActive) {
                await axios.post(
                    `${BASE_URL}/api/applications/apply`,
                    { user_id: myUserId, job_id: jobId, resume_id: defaultResumeId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
        } catch (err) {
            console.error('지원 토글 실패', err);
        }
    };

    const [applicationsStatus, setApplicationsStatus] = useState({});
    useEffect(() => {
        const fetchApplications = async () => {
            if (!myUserId) return;

            try {
                const token = await AsyncStorage.getItem('accessToken');
                const res = await axios.get(
                    `${BASE_URL}/api/applications/my-applications/${myUserId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                // 상태 객체로 변환 (job_id 기준)
                const statusMap = {};
                res.data.forEach(app => {
                    statusMap[app.job_id] = {
                        status: app.status,
                        is_viewed: app.is_viewed,
                        applicationId: app.id,
                    };
                });

                setApplicationsStatus(statusMap);
            } catch (err) {
                console.error('지원 현황 불러오기 실패:', err);
            }
        };

        fetchApplications();
    }, [myUserId]);


    const formatCareerRange = (careerArray) => {
        if (!careerArray || careerArray.length === 0) return '정보 없음';

        // 숫자 경력만 분리 (예: "1년", "2년")
        const numberCareers = careerArray
            .filter(item => /^\d+년$/.test(item))
            .map(item => parseInt(item.replace('년', ''), 10));

        const specialCareers = careerArray.filter(item => !/^\d+년$/.test(item));

        let range = '';
        if (numberCareers.length > 0) {
            numberCareers.sort((a, b) => a - b);
            range = `${numberCareers[0]}~${numberCareers[numberCareers.length - 1]}년`;
        }

        // 숫자 경력 + 특수 경력 합치기
        return [...(range ? [range] : []), ...specialCareers].join(', ');
    };



    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.scrollContent}
                onScroll={(e) => {
                    const offsetY = e.nativeEvent.contentOffset.y;
                    setShowScrollTop(offsetY > 0);
                    if (showOptions) setShowOptions(false);
                }}
                scrollEventThrottle={16}
            >
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{job.title || '제목 없음'}</Text>

                    <TouchableOpacity
                        onPress={() => setShowOptions(prev => !prev)}
                        style={{ padding: 10, marginLeft: 10 }}
                    >
                        <Image
                            source={IMAGES.THREEDOT}
                            resizeMode="contain"
                            style={{ height: 18, width: 18 }}
                        />
                    </TouchableOpacity>

                    {showOptions && (
                        <View style={styles.popup}>
                            <TouchableOpacity onPress={() => {
                                setShowOptions(false);
                                handleReportJobPost(job);
                            }}>
                                <Text style={styles.popupItem}>신고하기</Text>
                            </TouchableOpacity>

                            {myUserId === job.user_id && (
                                <>
                                    <View style={styles.popupDivider} />
                                    <TouchableOpacity onPress={() => {
                                        setShowOptions(false);
                                        navigation.navigate('EditJobScreen', { id: job.id });
                                    }}>
                                        <Text style={styles.popupItem}>수정하기</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {(myUserId === job.user_id || role === 'ADMIN') && (
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

                <TouchableOpacity
                    onPress={() => navigation.navigate('CompanyDetailScreen', { companyId: job.user_id })}
                >
                    <Text style={[styles.company, { textDecorationLine: 'underline' }]}>
                        {job.company || '회사명 없음'}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.location}>{job.location || '위치 정보 없음'}</Text>

                <View style={styles.photoContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={imageUris}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item }} style={styles.photo} />
                        )}
                        onViewableItemsChanged={onViewRef.current}
                        viewabilityConfig={viewConfigRef.current}
                    />
                    <View style={styles.pagination}>
                        {imageUris.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    currentImageIndex === index ? styles.dotActive : null,
                                ]}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {job.deadline && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>마감: {job.deadline}</Text>
                            </View>
                        )}
                        {job.filters?.education?.length > 0 && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>경력: {formatCareerRange(job.filters.career)}</Text>
                            </View>
                        )}
                        {job.filters?.education?.length > 0 && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>학력: {job.filters.education.join(', ')}</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>채용 상세 내용</Text>
                    <Text style={styles.text}>{job.detail}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>필요 기술 및 우대 사항</Text>
                    <Text style={styles.text}>{job.preferred_skills}</Text>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>기타 조건</Text>
                    <Text style={styles.text}>{job.working_conditions || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>직무</Text>
                    <Text style={[styles.text, { marginBottom: 8 }]}>
                        {job.filters?.job?.join(', ') || '정보 없음'}
                    </Text>

                    <Text style={[styles.sectionTitle, { marginTop: 12, marginBottom: 4 }]}>지역</Text>
                    <Text style={[styles.text, { marginBottom: 8 }]}>
                        {job.filters?.region?.join(', ') || '정보 없음'}
                    </Text>

                    <Text style={[styles.sectionTitle, { marginTop: 12, marginBottom: 4 }]}>기업유형</Text>
                    <Text style={[styles.text, { marginBottom: 8 }]}>
                        {job.filters?.companyType?.join(', ') || '정보 없음'}
                    </Text>

                    <Text style={[styles.sectionTitle, { marginTop: 12, marginBottom: 4 }]}>고용형태</Text>
                    <Text style={[styles.text, { marginBottom: 8 }]}>
                        {job.filters?.employmentType?.join(', ') || '정보 없음'}
                    </Text>
                </View>


                {job.personalized && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>장애인 채용 조건</Text>

                        {Object.entries(job.personalized).map(([key, values]) => {
                            if (!values || values.length === 0) return null;

                            const labelMap = {
                                disabilityGrade: '장애 정도',
                                disabilityTypes: '장애 유형',
                                assistiveDevices: '보조 기구',
                                jobInterest: '직무 관심',
                                preferredWorkType: '선호 근무 형태',
                            };

                            return (
                                <Text key={key} style={[styles.text, { marginBottom: 8 }]}>
                                    <Text style={styles.boldText}>{labelMap[key]}: </Text>
                                    {values.join(', ')}
                                </Text>
                            );
                        })}
                    </View>
                )}




            </ScrollView>
            {!(role === 'COMPANY' || role === 'ADMIN') && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.scrapButton, { flex: 1 }]}
                        onPress={() => toggleFavorite(job.id, 'job')} // type 전달
                    >
                        <View style={styles.scrapContent}>
                            <FontAwesome
                                name={favorites.job?.[job.id] ? 'bookmark' : 'bookmark-o'} // job으로 접근
                                size={20}
                                color={favorites.job?.[job.id] ? '#FFD700' : '#fff'}
                                style={styles.scrapIcon}
                            />
                            <Text style={styles.scrapText}>스크랩</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            job.status === 'inactive'
                                ? { backgroundColor: "#6c757d" } // 마감 버튼 회색
                                : applicationsStatus[job.id]?.is_viewed === 1
                                    ? { backgroundColor: statusColorMap[applicationsStatus[job.id]?.status] || "#6c757d" }
                                    : applications[job.id]
                                        ? styles.cancelButton
                                        : styles.applyButton,
                            { flex: 2 },
                        ]}
                        onPress={() => toggleApplication(job.id)}
                        disabled={job.status === 'inactive' || applicationsStatus[job.id]?.is_viewed === 1} // inactive면 비활성화
                    >
                        <Text style={styles.buttonText}>
                            {job.status === 'inactive'
                                ? "마감됨"
                                : applicationsStatus[job.id]?.is_viewed === 1
                                    ? applicationsStatus[job.id]?.status
                                    : applications[job.id]
                                        ? "지원취소"
                                        : "지원하기"}
                        </Text>
                    </TouchableOpacity>



                </View>
            )}

            {showScrollTop && (
                <TouchableOpacity
                    style={styles.scrollTopButton}
                    onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
                >
                    <Ionicons name="chevron-up" size={24} color="black" />
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                    setShowModal(true);
                    setCurrentJobId(job.id);
                }}
            >
                <Ionicons name="bulb-outline" size={24} color={COLORS.THEMECOLOR} />
            </TouchableOpacity>

            <AiSummaryModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                type="jobSummary"
                id={currentJobId}
            />
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
        paddingBottom: hp('10%'),
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp('1.2%'),
    },
    title: {
        fontSize: wp('6%'),
        fontWeight: '700',
        color: '#111',
        flexShrink: 1,
    },
    company: {
        fontSize: wp('4.5%'),
        fontWeight: '600',
        marginBottom: hp('0.8%'),
        color: COLORS.THEMECOLOR
    },
    location: {
        fontSize: wp('4%'),
        color: '#666',
        marginBottom: hp('2%'),
        fontWeight: '400',
    },
    photoContainer: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT + 20,
        alignSelf: 'center',
        marginBottom: hp('3%'),
    },
    photo: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#bbb',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: COLORS.THEMECOLOR,
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
        marginBottom: hp('3%'),
    },
    tag: {
        backgroundColor: '#f0f0f0',
        borderRadius: wp('5%'),
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1%'),
        marginRight: wp('3%'),
        marginBottom: hp('1%'),
        borderWidth: 1,
        borderColor: '#ddd',
    },
    tagText: {
        fontSize: wp('3.8%'),
        color: '#555',
        fontWeight: '500',
    },
    section: {
        marginBottom: hp('3.5%'),
    },
    sectionTitle: {
        fontSize: wp('5.2%'),
        fontWeight: '700',
        marginBottom: hp('1.2%'),
        color: '#222',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: hp('0.5%'),
    },
    text: {
        fontSize: wp('4.3%'),
        color: '#333',
        lineHeight: hp('3.3%'),
    },
    boldText: {
        fontWeight: '700',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('1.5%'),
        position: 'absolute',
        bottom: hp('4%'),
        width: wp('100%'),
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    button: {
        backgroundColor: '#999',
        marginHorizontal: wp('2%'),
        paddingVertical: hp('1.8%'),
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButton: {
        backgroundColor: COLORS.THEMECOLOR,
    },
    scrapButton: {
        backgroundColor: '#666',
    },
    scrapContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrapIcon: {
        marginRight: wp('2.5%'),
    },
    scrapText: {
        color: '#fff',
        fontSize: wp('4.3%'),
        fontWeight: '700',
    },
    buttonText: {
        color: '#fff',
        fontSize: wp('4.3%'),
        fontWeight: '700',
    },
    modalButton: {
        position: 'absolute',
        bottom: hp('15%'),
        left: wp('5%'),
        backgroundColor: '#fff',
        borderRadius: 25,
        borderWidth: 2,
        borderColor: COLORS.THEMECOLOR,
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    scrollTopButton: {
        position: 'absolute',
        bottom: hp('15%'),
        right: wp('5%'),
        backgroundColor: '#fff',
        borderRadius: 25,
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    popup: {
        position: 'absolute',
        top: 15,
        right: 30,
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
