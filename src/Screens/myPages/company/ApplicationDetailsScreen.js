import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Platform,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import COLORS from '../../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import IMAGES from '../../../assets/images';
import axios from 'axios';
import { BASE_URL } from '@env';
import { useFocusEffect } from '@react-navigation/native';

export default function ApplicationDetailsScreen({ route }) {
    const scrollRef = useRef();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [resume, setResume] = useState(route.params.resume);
    const [selectedStatus, setSelectedStatus] = useState(resume.status || '서류 심사중');

    const statusOptions = ['서류 심사중', '1차 합격', '면접 예정', '최종 합격', '불합격'];

    const handleStatusSelect = (status) => {
        Alert.alert(
            "상태 변경",
            `${status}으로 상태를 변경하시겠습니까?`,
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                {
                    text: "확인",
                    onPress: async () => {
                        setSelectedStatus(status);

                        try {
                            const userInfo = await AsyncStorage.getItem('userInfo');
                            if (!userInfo) return;

                            const parsed = JSON.parse(userInfo);
                            const token = await AsyncStorage.getItem('accessToken');
                            const headers = { Authorization: `Bearer ${token}` };

                            // 서버로 상태 저장
                            await axios.put(
                                `${BASE_URL}/api/resume-status/${resume.id}`,
                                { status },
                                { headers }
                            );
                        } catch (error) {
                            console.error('상태 변경 오류:', error);
                            Alert.alert("오류", "상태 변경 중 문제가 발생했습니다.");
                        }
                    }
                }
            ]
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
                        </View>
                    )}
                </View>

                {/* 섹션별 내용 */}
                {[
                    { title: '인적사항', value: resume.personalInfo },
                    { title: '희망직무', value: resume.desiredJob },
                    { title: '학력', value: resume.education },
                    { title: '경력', value: resume.career },
                    { title: '자기소개서', value: resume.selfIntroduction },
                    { title: '자격증', value: resume.certificates },
                    { title: '인턴 / 대외활동', value: resume.internshipActivities },
                    { title: '취업우대 / 병역', value: resume.preferencesMilitary },
                    { title: '희망 근무 조건', value: resume.workConditions },
                ].map((section) => (
                    <View style={styles.section} key={section.title}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.text}>{section.value || '정보 없음'}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* 상태 선택 버튼 영역 (가로 스크롤) */}
            <View style={styles.buttonScrollContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.buttonScrollInner}
                >
                    {statusOptions.map((status) => (
                        <TouchableOpacity
                            key={status}
                            onPress={() => handleStatusSelect(status)}
                            style={[
                                styles.button,
                                selectedStatus === status && styles.selectedStatusButton
                            ]}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    selectedStatus === status && styles.selectedStatusText
                                ]}
                            >
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
        color: "#333",
    },
    buttonScrollContainer: {
        position: 'absolute',
        bottom: 0, // 컨테이너는 화면 맨 아래
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
});
