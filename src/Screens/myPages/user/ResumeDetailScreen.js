import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import COLORS from '../../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import IMAGES from '../../../assets/images';
import axios from 'axios';
import { Alert } from 'react-native';
import { BASE_URL } from '@env';
import { useFocusEffect } from '@react-navigation/native';
import { Platform } from 'react-native';


export default function ResumeDetailScreen({ route, navigation }) {

    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [myUserId, setMyUserId] = useState(null);
    const [role, setRole] = useState(null);
    const scrollRef = useRef();

    const [resume, setResume] = useState(route.params.resume);
    const [isDefault, setIsDefault] = useState(route.params.resume.is_default || false);



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
            const fetchResumeDetail = async () => {
                try {
                    const response = await axios.get(`${BASE_URL}/api/resumes/${resume.id}`);
                    if (response.data) {
                        setResume(response.data); // 최신 데이터로 업데이트
                    }
                } catch (error) {
                    console.error('공고 불러오기 실패', error);
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
                setMyUserId(userInfo.id);  // ✅ 여기서 id만 추출
            }
        };
        getUserId();
    }, []);

    const setAsDefaultResume = async () => {
        try {
            // 서버에 is_default: true 로 PATCH 요청
            await axios.patch(`${BASE_URL}/api/resumes/${resume.id}`, {
                is_default: true,
            });

            // 상태 업데이트
            setIsDefault(true);

            Alert.alert('성공', '기본 이력서로 설정되었습니다.');

            // 필요하면 리스트 화면 등으로 돌아가거나 resume 데이터 다시 불러오기
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '기본 이력서 설정에 실패했습니다.');
        }
    };


    const handleDelete = async () => {
        Alert.alert(
            '이력서 삭제',
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
                            const response = await axios.delete(`${BASE_URL}/api/resumes/${resume.id}`);
                            if (response.data.success) {
                                Alert.alert('삭제 완료', '이력서가 삭제되었습니다.');
                                navigation.goBack(); // 이전 화면으로 이동
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


    const handleReportUser = async (resume) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('로그인 필요', '신고하려면 로그인이 필요합니다.');
                return;
            }

            const reason = `${resume.name} 사용자의 이력서를 신고합니다.`;

            const response = await axios.post(
                `${BASE_URL}/api/reports`,
                {
                    target_type: 'USER',  // USER로 변경
                    target_id: resume.user.id,   // 신고할 사용자 ID
                    reason: reason
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                Alert.alert('신고 완료', `${resume.name} 사용자가 신고되었습니다.`);
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
                                    <TouchableOpacity onPress={() => {
                                        setShowOptions(false);
                                        navigation.navigate('EditResumeScreen', { id: resume.id });
                                    }}>
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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>인적사항</Text>
                    <Text style={styles.text}>{resume.personalInfo || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>희망직무</Text>
                    <Text style={styles.text}>{resume.desiredJob || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>학력</Text>
                    <Text style={styles.text}>{resume.education || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>경력</Text>
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
                    <Text style={styles.sectionTitle}>인턴 / 대외활동</Text>
                    <Text style={styles.text}>{resume.internshipActivities || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>취업우대 / 병역</Text>
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
    scrollTopButton: {
        position: 'absolute',
        bottom: hp('15%'),
        right: wp('5%'),
        backgroundColor: Platform.OS === 'android' ? '#fff' : 'rgba(255,255,255,0.8)',
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
