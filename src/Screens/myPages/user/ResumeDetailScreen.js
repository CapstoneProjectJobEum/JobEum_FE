import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Platform, } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import IMAGES from '../../../assets/images';
import COLORS from '../../../constants/colors';
import AiSummaryModal from '../../features/AiSummaryModal';


export default function ResumeDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [myUserId, setMyUserId] = useState(null);
    const [role, setRole] = useState(null);
    const scrollRef = useRef();
    const [resume, setResume] = useState(route.params.resume);
    const [isDefault, setIsDefault] = useState(route.params.resume.is_default || false);
    const [showModal, setShowModal] = useState(false);
    const [currentResumeId, setCurrentResumeId] = useState(null);


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
            if (!resume.id) return;
            const fetchResumeDetail = async () => {
                try {
                    const token = await AsyncStorage.getItem('accessToken');
                    const response = await axios.get(`${BASE_URL}/api/resumes/${resume.id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.data) {
                        const r = response.data;
                        setResume({
                            id: r.id,
                            user_id: r.user_id,
                            title: r.title,
                            createdAt: r.created_at,
                            isDefault: r.is_default === 1 || r.is_default === true,
                            personalInfo: {
                                name: r.name,
                                birth: r.birth,
                                gender: r.gender,
                                phone: r.phone,
                                email: r.email,
                            },
                            desiredJob: r.disability_requirements?.job?.join(', ') || '',
                            careerRequirement: r.disability_requirements?.career?.join(', ') || '',
                            educationRequirement: r.disability_requirements?.education?.join(', ') || '',
                            employmentTypeRequirement: r.disability_requirements?.employmentType?.join(', ') || '',
                            regionRequirement: r.disability_requirements?.region?.join(', ') || '',
                            education: r.education_detail,
                            career: r.career_detail,
                            selfIntroduction: r.self_introduction,
                            certificates: r.certificates,
                            internshipActivities: r.internship_activities,
                            preferencesMilitary: r.preferences_military,
                            workConditions: r.working_conditions,
                        });
                        setIsDefault(r.is_default === 1 || r.is_default === true);
                    }
                } catch (error) {
                    console.error('이력서 상세 조회 실패', error);
                }
            };

            fetchResumeDetail();
        }, [resume.id])
    );

    useEffect(() => {
        const getUserId = async () => {
            const userInfoString = await AsyncStorage.getItem('userInfo');
            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                setMyUserId(userInfo.id);
            }
        };
        getUserId();
    }, []);


    const setAsDefaultResume = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            await axios.put(`${BASE_URL}/api/resumes/${resume.id}/default`, {
                user_id: myUserId,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setIsDefault(true);
            Alert.alert('성공', '기본 이력서로 설정되었습니다.');
        } catch (error) {
            console.error('기본 이력서 설정 실패', error);
            Alert.alert('오류', '기본 이력서 설정에 실패했습니다.');
        }
    };

    const handleEdit = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('로그인 필요', '수정하려면 로그인 해주세요.');
                return;
            }

            const res = await axios.get(`${BASE_URL}/api/resumes/${resume.id}/check-application`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 200 && res.data.success) {
                navigation.navigate('EditResumeScreen', { id: resume.id });
            }

        } catch (err) {
            if (err.response?.status === 400) {
                Alert.alert('수정 불가', '지원한 내역이 있어 수정할 수 없습니다.');
            } else {
                console.error('수정 체크 오류:', err);
                Alert.alert('오류', '수정 가능 여부 확인 중 문제가 발생했습니다.');
            }
        }
    };



    const handleDelete = async () => {
        Alert.alert(
            '이력서 삭제',
            '정말 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('accessToken');
                            if (!token) {
                                Alert.alert('로그인 필요', '삭제하려면 로그인 해주세요.');
                                return;
                            }

                            const res = await axios.delete(`${BASE_URL}/api/resumes/${resume.id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            if (res.status === 200 && res.data.success) {
                                Alert.alert('삭제 완료', '이력서가 삭제되었습니다.');
                                navigation.goBack();
                            }
                        } catch (err) {
                            if (err.response?.status === 400) {
                                // 지원 내역 때문에 삭제 불가
                                Alert.alert('삭제 불가', '지원한 내역이 있어 삭제할 수 없습니다.');
                            } else {
                                console.error('삭제 오류:', err);
                                Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
                            }
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };


    const handleReportUser = async (resume) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('로그인 필요', '신고하려면 로그인이 필요합니다.');
                return;
            }

            const reason = `${resume.personalInfo?.name} 사용자의 이력서를 신고합니다.`;

            const response = await axios.post(
                `${BASE_URL}/api/reports`,
                {
                    target_type: 'USER',
                    target_id: resume.user_id,
                    reason: reason
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                Alert.alert('신고 완료', `${resume.personalInfo?.name} 사용자가 신고되었습니다.`);
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
                                handleReportUser(resume);
                            }}>
                                <Text style={styles.popupItem}>신고하기</Text>
                            </TouchableOpacity>

                            {(myUserId === resume.user_id || role === 'ADMIN') && (
                                <>
                                    <View style={styles.popupDivider} />
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowOptions(false);
                                            handleEdit();
                                        }}
                                    >
                                        <Text style={styles.popupItem}>수정하기</Text>
                                    </TouchableOpacity>

                                    <View style={styles.popupDivider} />
                                    <TouchableOpacity onPress={handleDelete}>
                                        <Text style={styles.popupItem}>삭제하기</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}
                </View>
                <View style={styles.fieldWrapper}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>인적사항</Text>
                    </View>

                    {/* 이름 */}
                    <TextInput
                        style={styles.readOnlyInput}
                        value={resume.personalInfo?.name || ''}
                        editable={false}
                    />

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                        <TextInput
                            style={[styles.readOnlyInput, { flex: 1, marginRight: 8 }]}
                            value={resume.personalInfo?.birth || ''}
                            editable={false}
                        />
                        <TextInput
                            style={[styles.readOnlyInput, { flex: 1 }]}
                            value={resume.personalInfo?.gender || ''}
                            editable={false}
                        />
                    </View>
                    <TextInput
                        style={styles.readOnlyInput}
                        value={resume.personalInfo?.phone?.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3") || ''}
                        editable={false}
                    />
                    <TextInput
                        style={styles.readOnlyInput}
                        value={resume.personalInfo?.email || ''}
                        editable={false}
                    />

                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>희망 직무</Text>
                    <Text style={styles.text}>{resume.desiredJob || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>희망 지역</Text>
                    <Text style={styles.text}>{resume.regionRequirement || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>희망 고용형태</Text>
                    <Text style={styles.text}>{resume.employmentTypeRequirement || '정보 없음'}</Text>
                </View>



                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>학력</Text>
                    <Text style={styles.text}>{resume.educationRequirement || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>경력</Text>
                    <Text style={styles.text}>{resume.careerRequirement || '정보 없음'}</Text>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>학력(상세입력)</Text>
                    <Text style={styles.text}>{resume.education || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>경력(상세입력)</Text>
                    <Text style={styles.text}>{resume.career || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>자기소개서</Text>
                    <Text style={styles.text}>{resume.selfIntroduction || '내용 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>자격증</Text>
                    <Text style={styles.text}>{resume.certificates || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>인턴 · 대외활동</Text>
                    <Text style={styles.text}>{resume.internshipActivities || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>취업우대 · 병역</Text>
                    <Text style={styles.text}>{resume.preferencesMilitary || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>희망 근무 조건</Text>
                    <Text style={styles.text}>{resume.workConditions || '정보 없음'}</Text>
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, isDefault && { backgroundColor: 'gray' }]}
                    onPress={setAsDefaultResume}
                    disabled={isDefault}
                >
                    <Text style={styles.buttonText}>
                        {isDefault ? '기본 이력서로 설정됨' : '기본 이력서로 설정'}
                    </Text>
                </TouchableOpacity>
            </View>
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
                    setCurrentResumeId(resume.id);
                }}
            >
                <Ionicons name="bulb-outline" size={24} color={COLORS.THEMECOLOR} />
            </TouchableOpacity>

            <AiSummaryModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                type="reviewSummary"
                id={currentResumeId}
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
        paddingBottom: hp('15%'),
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
        flex: 1,
        backgroundColor: COLORS.THEMECOLOR,
        marginHorizontal: wp('2%'),
        paddingVertical: hp('1.8%'),
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: wp('4.3%'),
        fontWeight: '600',
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
