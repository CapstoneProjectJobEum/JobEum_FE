import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform, TextInput, } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';
import IMAGES from '../../../assets/images';


export default function ApplicationDetailsScreen() {
    const route = useRoute();
    const scrollRef = useRef();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const { applicationId: paramAppId } = route.params || {};
    const [applicationId, setApplicationId] = useState(paramAppId || null);
    const [resume, setResume] = useState({});
    const [selectedStatus, setSelectedStatus] = useState('서류 심사중');

    const statusOptions = ['서류 심사중', '1차 합격', '면접 예정', '최종 합격', '불합격'];

    // 상세 지원서 불러오는 함수 (컴포넌트 스코프)
    useEffect(() => {
        if (!applicationId) return;

        const fetchApplicationDetail = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                if (!token) return;

                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(`${BASE_URL}/api/applications/${applicationId}`, { headers });

                setResume(res.data || {});
                setSelectedStatus(res.data?.status || '서류 심사중');



            } catch (err) {
                console.error('상세 지원서 불러오기 실패', err);
            }
        };

        fetchApplicationDetail();
    }, [applicationId]);


    // 지원서 상태 변경
    const handleStatusSelect = (status) => {
        if (!resume.user_id || !resume.resume_id || !resume.job_id) return;

        Alert.alert(
            "상태 변경",
            `${status}으로 상태를 변경하시겠습니까?`,
            [
                { text: "취소", style: "cancel" },
                {
                    text: "확인",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('accessToken');
                            if (!token) return;

                            const headers = { Authorization: `Bearer ${token}` };

                            const res = await axios.put(
                                `${BASE_URL}/api/applications/status`,
                                {
                                    user_id: resume.user_id,
                                    resume_id: resume.resume_id,
                                    job_id: resume.job_id,
                                    status
                                },
                                { headers }
                            );

                            console.log('상태 변경 응답:', res.data);
                            setSelectedStatus(status);
                            setResume(prev => ({ ...prev, status }));
                        } catch (err) {
                            console.error('상태 변경 오류', err);
                            Alert.alert('오류', '상태 변경 중 문제가 발생했습니다.');
                        }
                    }
                }
            ]
        );
    };

    // 사용자 신고
    const handleReportUser = async (resume) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('로그인 필요', '신고하려면 로그인이 필요합니다.');
                return;
            }

            const reason = `${resume.name} 사용자의 이력서를 신고합니다.`;

            await axios.post(
                `${BASE_URL}/api/reports`,
                {
                    target_type: 'USER',
                    target_id: resume.user_id,
                    reason: reason
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('신고 완료', `${resume.name} 사용자가 신고되었습니다.`);
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
                    const offsetY = e.nativeEvent.contentOffset.y;
                    setShowScrollTop(offsetY > 0);
                    if (showOptions) setShowOptions(false);
                }}
                scrollEventThrottle={16}
            >
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{resume.title || '제목 없음'}</Text>
                    <TouchableOpacity
                        onPress={() => setShowOptions(prev => !prev)}
                        style={{ padding: 10, marginLeft: 10 }}
                    >
                        <Image source={IMAGES.THREEDOT} resizeMode="contain" style={{ height: 18, width: 18 }} />
                    </TouchableOpacity>
                    {showOptions && (
                        <View style={styles.popup}>
                            <TouchableOpacity onPress={() => { setShowOptions(false); handleReportUser(resume); }}>
                                <Text style={styles.popupItem}>신고하기</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.fieldWrapper}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>인적사항</Text>
                    </View>


                    <TextInput
                        style={styles.readOnlyInput}
                        value={resume.name || ''}
                        editable={false}
                    />

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                            style={[styles.readOnlyInput, { flex: 1, marginRight: 8 }]}
                            value={resume.birth || ''}
                            editable={false}
                        />
                        <TextInput
                            style={[styles.readOnlyInput, { flex: 1 }]}
                            value={resume.gender || ''}
                            editable={false}
                        />
                    </View>

                    <TextInput
                        style={styles.readOnlyInput}
                        value={resume.phone?.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3") || ''}
                        editable={false}
                    />
                    <TextInput
                        style={styles.readOnlyInput}
                        value={resume.email || ''}
                        editable={false}
                    />
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>희망 직무</Text>
                    <Text style={styles.text}>
                        {resume.disability_requirements?.job?.join(', ') || '정보 없음'}
                    </Text>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>희망 지역</Text>
                    <Text style={styles.text}>
                        {resume.disability_requirements?.region?.join(', ') || '정보 없음'}
                    </Text>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>희망 고용형태</Text>
                    <Text style={styles.text}>
                        {resume.disability_requirements?.employmentType?.join(', ') || '정보 없음'}
                    </Text>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>학력</Text>
                    <Text style={styles.text}>
                        {resume.education_detail || '정보 없음'}
                    </Text>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>경력</Text>
                    <Text style={styles.text}>
                        {resume.career_detail || '정보 없음'}
                    </Text>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>자기소개서</Text>
                    <Text style={styles.text}>
                        {resume.self_introduction || '내용 없음'}
                    </Text>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>자격증</Text>
                    <Text style={styles.text}>
                        {resume.certificates || '정보 없음'}
                    </Text>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>인턴 · 대외활동</Text>
                    <Text style={styles.text}>
                        {resume.internship_activities || '정보 없음'}
                    </Text>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>취업우대 · 병역</Text>
                    <Text style={styles.text}>
                        {resume.preferences_military || '정보 없음'}
                    </Text>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>희망 근무 조건</Text>
                    <Text style={styles.text}>
                        {resume.working_conditions || '정보 없음'}
                    </Text>
                </View>

            </ScrollView>

            <View style={styles.buttonScrollContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.buttonScrollInner}>
                    {statusOptions.map(status => (
                        <TouchableOpacity
                            key={status}
                            onPress={() => handleStatusSelect(status)}
                            style={[styles.button, selectedStatus === status && styles.selectedStatusButton]}
                        >
                            <Text style={[styles.buttonText, selectedStatus === status && styles.selectedStatusText]}>
                                {status}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {showScrollTop && (
                <TouchableOpacity
                    style={styles.scrollTopButton}
                    onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
                >
                    <Ionicons name="chevron-up" size={24} color="black" />
                </TouchableOpacity>
            )}
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
        paddingBottom: hp('15%'),
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp('1.2%'),
    },
    title: {
        fontSize: wp('6.5%'),
        fontWeight: 'bold',
        marginBottom: hp('2%'),
        color: '#111',
    },
    fieldWrapper: {
        marginBottom: hp("2%")
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    readOnlyInput: {
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        paddingHorizontal: wp("4%"),
        paddingVertical: hp("1.2%"),
        fontSize: wp("3.8%"),
        borderWidth: 1,
        borderColor: "#ddd",
        color: "#555",
        marginBottom: hp("0.8%"),
    },
    section: {
        marginBottom: hp('2.5%'),
    },
    sectionTitle: {
        fontSize: wp('5%'),
        fontWeight: '600',
        marginBottom: hp('0.8%'),
        color: '#222',
    },
    text: {
        fontSize: wp('4.2%'),
        color: '#333',
        lineHeight: hp('3%'),
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
        color: '#333',
    },
    buttonScrollContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        zIndex: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingVertical: hp('1%'),
        alignItems: 'flex-start',
    },
    buttonScrollInner: {
        flexDirection: 'row',
        paddingBottom: hp('0.5%'),
        paddingLeft: wp('5%'),
    },
    button: {
        backgroundColor: '#fff',
        marginRight: wp('3%'),
        marginBottom: wp('4%'),
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('3%'),
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        alignItems: 'center',
    },
    selectedStatusButton: {
        borderWidth: 0,
        backgroundColor: COLORS.THEMECOLOR,
        justifyContent: 'center',
    },
    buttonText: {
        color: '#444',
        fontSize: wp('4.3%'),
        fontWeight: '600',
    },
    selectedStatusText: {
        color: '#fff',
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
});
