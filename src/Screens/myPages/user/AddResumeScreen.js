import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert, } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "@env";
import COLORS from "../../../constants/colors";
import FilterModal from "../../features/FilterModal";

export default function AddResumeScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const [userInfo, setUserInfo] = useState(null);

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            title: '',
            residence: '',
            desiredJob: '',
            education_detail: '',
            career_detail: '',
            selfIntroduction: '',
            certificates: '',
            internshipActivities: '',
            preferencesMilitary: '',
            working_Conditions: '',
        },
    });


    // 필터 모달 상태
    const [selectedFilter, setSelectedFilter] = useState('조건추가');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterTitle, setFilterTitle] = useState('조건추가');
    const [fromConditionMenu, setFromConditionMenu] = useState(true);

    // 필터 조건 상태 (초기값)
    const [filters, setFilters] = useState({
        selectedJob: '식음료외식',
        selectedSubJob: [],
        selectedRegion: '전국',
        selectedSubRegion: [],
        selectedCareer: '신입',
        selectedSubCareer: [],
        selectedSubEducation: [],
        selectedSubEmploymentType: [],
    });

    const buildFilterParams = (filters) => {
        return {
            career: filters.selectedSubCareer.length > 0
                ? filters.selectedSubCareer
                : (filters.selectedCareer ? [filters.selectedCareer] : []),
            education: filters.selectedSubEducation,
            employmentType: filters.selectedSubEmploymentType,
            job: filters.selectedSubJob.length > 0
                ? filters.selectedSubJob
                : (filters.selectedJob ? [filters.selectedJob] : []),
            region: filters.selectedSubRegion.length > 0
                ? filters.selectedSubRegion
                : (filters.selectedRegion ? [filters.selectedRegion] : []),
        };
    };

    const [showSetComplete, setShowSetComplete] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                setUserId(userInfo.id);
            }
        };
        fetchUserInfo();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (route.params?.disability_requirements) {
                setFilters(route.params.disability_requirements);
                setShowSetComplete(true);
            } else {
                setShowSetComplete(false);
            }

            if (route.params?.formData) {
                reset(route.params.formData);
            }
            if (route.params?.images) {
                setImages(route.params.images);
            }
        }, [route.params, reset])
    );

    const requiredFilterKeys = [
        'selectedSubJob',
        'selectedSubRegion',
        'selectedSubCareer',
        'selectedSubEducation',
        'selectedSubEmploymentType',
    ];

    const validateFilters = (filters) => {
        for (const key of requiredFilterKeys) {
            if (!filters[key] || filters[key].length === 0) {
                return false;
            }
        }
        return true;
    };
    const onSubmit = async (formData) => {

        if (!formData?.title?.trim()) {
            Alert.alert('입력 오류', '이력서 제목을 입력해주세요.');
            return;
        }
        if (!formData?.residence?.trim()) {
            Alert.alert('입력 오류', '거주지를 입력해주세요.');
            return;
        }
        if (!formData?.education_detail?.trim()) {
            Alert.alert('입력 오류', '학력 정보를 입력해주세요.');
            return;
        }
        if (!formData?.career_detail?.trim()) {
            Alert.alert('입력 오류', '경력 정보를 입력해주세요.');
            return;
        }
        if (!formData?.selfIntroduction?.trim()) {
            Alert.alert('입력 오류', '자기소개서를 입력해주세요.');
            return;
        }
        if (!formData?.certificates?.trim()) {
            Alert.alert('입력 오류', '자격증 정보를 입력해주세요.');
            return;
        }
        if (!formData?.internshipActivities?.trim()) {
            Alert.alert('입력 오류', '인턴 · 대외활동 정보를 입력해주세요.');
            return;
        }
        if (!formData?.preferencesMilitary?.trim()) {
            Alert.alert('입력 오류', '취업우대 · 병역 정보를 입력해주세요.');
            return;
        }
        if (!formData?.working_Conditions?.trim()) {
            Alert.alert('입력 오류', '희망 근무 조건을 입력해주세요.');
            return;
        }

        if (!validateFilters(filters)) {
            Alert.alert('입력 오류', '필수 필터를 모두 선택해 주세요.');
            return;
        }

        if (!userId || !userInfo) {
            Alert.alert('입력 오류', '사용자 정보가 없습니다. 다시 로그인 해주세요.');
            return;
        }

        try {
            const filterParams = buildFilterParams(filters);

            const fullData = {
                user_id: userId,
                title: formData.title,
                residence: formData.residence,
                education_detail: formData.education_detail,
                career_detail: formData.career_detail,
                self_introduction: formData.selfIntroduction,
                certificates: formData.certificates,
                internship_activities: formData.internshipActivities,
                preferences_military: formData.preferencesMilitary,
                working_conditions: formData.working_Conditions,
                disability_requirements: filterParams,
                is_default: true,
                name: userInfo.name,
                birth: userInfo.birth,
                gender: userInfo.gender,
                phone: userInfo.phone,
                email: userInfo.email,
            };

            console.log('서버에 보낼 데이터:', JSON.stringify(fullData, null, 2));

            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('로그인 필요', '이력서를 등록하려면 로그인 해주세요.');
                return;
            }

            await axios.post(`${BASE_URL}/api/resumes`, fullData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            Alert.alert('등록 완료', '이력서가 성공적으로 추가되었습니다.');

            // 초기화
            reset();
            setFilters({
                selectedJob: '식음료외식',
                selectedSubJob: [],
                selectedRegion: '전국',
                selectedSubRegion: [],
                selectedCareer: '신입',
                selectedSubCareer: [],
                selectedSubEducation: [],
                selectedSubEmploymentType: [],
            });
            setShowSetComplete(false);

            // 이동
            navigation.navigate('RouteScreen', {
                screen: 'MainTab',
                params: {
                    screen: 'MY',
                    params: {
                        screen: 'MemberMyScreen',
                        params: { selectedTab: '이력서 관리' },
                    },
                },
            });

        } catch (error) {
            if (error.response) {
                Alert.alert('전송 실패', `오류 코드: ${error.response.status}`);
            } else if (error.request) {
                Alert.alert('전송 실패', '서버 응답이 없습니다.');
            } else {
                Alert.alert('전송 실패', error.message);
            }
        }
    };





    // 모달 열기
    const openFilterModal = (title) => {
        setFilterTitle(title);

        if (title === '조건추가') {
            setSelectedFilter('조건추가'); // 전체 초기화용
            setFromConditionMenu(true);
        } else {
            setSelectedFilter(title); // 개별 필터 제목
            setFromConditionMenu(false);
        }

        setFilterModalVisible(true);
    };

    // 필터 초기화
    const handleReset = () => {
        if (selectedFilter === '조건추가') {
            // 전체 초기화
            setFilters({
                selectedJob: '식음료외식',
                selectedSubJob: [],
                selectedRegion: '전국',
                selectedSubRegion: [],
                selectedCareer: '신입',
                selectedSubCareer: [],
                selectedSubEducation: [],
                selectedSubEmploymentType: [],
            });
            setShowSetComplete(false);
        } else {
            // 선택된 필터별 부분 초기화
            switch (selectedFilter) {
                case '직무':
                    setFilters(f => ({
                        ...f,
                        selectedJob: '식음료외식',
                        selectedSubJob: [],
                    }));
                    break;
                case '지역':
                    setFilters(f => ({
                        ...f,
                        selectedRegion: '전국',
                        selectedSubRegion: [],
                    }));
                    break;
                case '경력':
                    setFilters(f => ({
                        ...f,
                        selectedCareer: '신입',
                        selectedSubCareer: [],
                    }));
                    break;
                case '학력':
                    setFilters(f => ({
                        ...f,
                        selectedSubEducation: [],
                    }));
                    break;
                case '고용형태':
                    setFilters(f => ({
                        ...f,
                        selectedSubEmploymentType: [],
                    }));
                    break;
                default:
                    break;
            }
        }
    };


    // 필터 적용
    const handleApply = () => {
        setFilterModalVisible(false);
        setShowSetComplete(true);
    };

    // 필터 메뉴 내 다른 필터 선택
    const handleSelectFilterFromMenu = (title) => {
        setSelectedFilter(title);
        setFilterTitle(title);
        setFromConditionMenu(true);
    };

    // '채용 조건 설정하기' 버튼 핸들러
    const handleSetCondition = () => {
        openFilterModal('조건추가');
    };


    // 사용자 정보 불러오기
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const storedUserInfo = await AsyncStorage.getItem("userInfo");
                if (storedUserInfo) {
                    const parsedUser = JSON.parse(storedUserInfo);
                    const token = await AsyncStorage.getItem('accessToken');
                    const res = await axios.get(
                        `${BASE_URL}/api/account-info/${parsedUser.id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setUserInfo(res.data);
                }
            } catch (error) {
                console.error("유저 정보 로딩 오류:", error);
                Alert.alert("오류", "계정 정보를 불러오는 중 문제가 발생했습니다.");
            }
        };
        fetchUserInfo();
    }, []);


    return (
        <>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    extraScrollHeight={5}
                >
                    <ScrollView style={{ backgroundColor: '#fff' }} contentContainerStyle={styles.container}>
                        {userInfo && (
                            <View style={styles.fieldWrapper}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>인적사항</Text>
                                    <Text style={styles.sectionNote}>
                                        ※ 수정은 계정 정보에서 가능합니다.
                                    </Text>
                                </View>

                                <TextInput
                                    style={styles.readOnlyInput}
                                    value={userInfo.name}
                                    editable={false}
                                />

                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TextInput
                                        style={[styles.readOnlyInput, { flex: 1, marginRight: 8 }]}
                                        value={userInfo.birth}
                                        editable={false}
                                    />
                                    <TextInput
                                        style={[styles.readOnlyInput, { flex: 1 }]}
                                        value={userInfo.gender}
                                        editable={false}
                                    />
                                </View>

                                <TextInput
                                    style={styles.readOnlyInput}
                                    value={userInfo.phone?.replace(
                                        /(\d{3})(\d{4})(\d{4})/,
                                        "$1-$2-$3"
                                    )}
                                    editable={false}
                                />

                                <TextInput
                                    style={styles.readOnlyInput}
                                    value={userInfo.email}
                                    editable={false}
                                />
                            </View>
                        )}

                        <View style={styles.fieldWrapper}>
                            <Text style={styles.label}>이력서 제목 *</Text>
                            <Controller
                                control={control}
                                name="title"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        style={styles.input}
                                        placeholder="나를 대표할 수 있는 한 줄 제목"
                                        value={value}
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                        </View>


                        <View style={styles.fieldWrapper}>
                            <Text style={styles.label}>거주지</Text>
                            <Controller
                                control={control}
                                name="residence"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        style={styles.input}
                                        placeholder="예: 서울특별시 강남구"
                                        value={value}
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                        </View>

                        <Text style={styles.sectionNote}>희망 직무, 지역 등을 설정하세요.</Text>

                        <TouchableOpacity
                            style={styles.subButton}
                            onPress={handleSetCondition}
                        >
                            <Text style={styles.subButtonText}>이력서 기본 정보 설정하기</Text>
                        </TouchableOpacity>

                        {showSetComplete && (
                            <View style={styles.completeMessageContainer}>
                                <Text style={styles.completeMessageText}>이력서 기본 정보가 설정되었습니다.</Text>
                            </View>
                        )}


                        {[
                            { name: "education_detail", label: "학력 (상세 입력)", placeholder: "추가로 졸업 학교, 전공, 학점 등 작성", multiline: true },
                            { name: "career_detail", label: "경력 (상세 입력)", placeholder: "담당 업무, 프로젝트 등 구체적으로 작성", multiline: true },
                            { name: "selfIntroduction", label: "자기소개서", placeholder: "자기소개 내용을 작성하세요", multiline: true },
                            { name: "certificates", label: "자격증", placeholder: "보유 자격증", multiline: true },
                            { name: "internshipActivities", label: "인턴 · 대외활동", placeholder: "인턴 경험 및 대외활동", multiline: true },
                            { name: "preferencesMilitary", label: "취업우대 · 병역", placeholder: "취업 우대 사항 및 병역 정보" },
                            { name: "working_Conditions", label: "희망 근무 조건", placeholder: "근무 시간, 연봉 등" },
                        ].map(({ name, label, placeholder, multiline }) => (
                            <View key={name} style={styles.fieldWrapper}>
                                <Text style={styles.label}>{label}</Text>
                                <Controller
                                    control={control}
                                    name={name}
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={[styles.input, multiline && styles.textArea]}
                                            placeholder={placeholder}
                                            value={value}
                                            onChangeText={onChange}
                                            multiline={multiline}
                                            scrollEnabled={multiline}
                                            showsVerticalScrollIndicator={multiline}
                                        />
                                    )}
                                />
                            </View>
                        ))}


                        <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                            <Text style={styles.buttonText}>등록하기</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    <FilterModal
                        visible={filterModalVisible}
                        onClose={() => setFilterModalVisible(false)}
                        title={filterTitle}
                        fromConditionMenu={fromConditionMenu}
                        setFromConditionMenu={setFromConditionMenu}
                        onReset={handleReset}
                        onApply={handleApply}
                        onSelectFilterFromMenu={handleSelectFilterFromMenu}
                        hideOptions={true}
                        excludeCareers={['경력무관']}
                        excludeEducation={['학력무관']}

                        selectedJob={filters.selectedJob}
                        setSelectedJob={(val) => setFilters(f => ({ ...f, selectedJob: val }))}
                        selectedSubJob={filters.selectedSubJob}
                        setSelectedSubJob={(val) => setFilters(f => ({ ...f, selectedSubJob: val }))}
                        selectedRegion={filters.selectedRegion}
                        setSelectedRegion={(val) => setFilters(f => ({ ...f, selectedRegion: val }))}
                        selectedSubRegion={filters.selectedSubRegion}
                        setSelectedSubRegion={(val) => setFilters(f => ({ ...f, selectedSubRegion: val }))}
                        selectedCareer={filters.selectedCareer}
                        setSelectedCareer={(val) => setFilters(f => ({ ...f, selectedCareer: val }))}
                        selectedSubCareer={filters.selectedSubCareer}
                        setSelectedSubCareer={(val) => setFilters(f => ({ ...f, selectedSubCareer: val }))}
                        selectedSubEducation={filters.selectedSubEducation}
                        setSelectedSubEducation={(val) => setFilters(f => ({ ...f, selectedSubEducation: val }))}
                        selectedSubEmploymentType={filters.selectedSubEmploymentType}
                        setSelectedSubEmploymentType={(val) => setFilters(f => ({ ...f, selectedSubEmploymentType: val }))}
                    />
                </KeyboardAwareScrollView>
            </SafeAreaView >
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: wp(5),
        backgroundColor: '#fff',
    },
    fieldWrapper: {
        marginBottom: hp("2%")
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 6,
    },
    sectionNote: {
        fontSize: 12,
        color: 'gray',
    },
    label: {
        fontSize: wp("4%"),
        fontWeight: "600",
        marginBottom: hp("0.5%"),
        color: "#333",
    },
    input: {
        backgroundColor: "#fafafa",
        borderRadius: 8,
        paddingHorizontal: wp("4%"),
        paddingVertical: hp("1.2%"),
        fontSize: wp("3.8%"),
        borderWidth: 1,
        borderColor: "#ccc",
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
    textArea: {
        height: hp("15%")
    },
    button: {
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: hp("1.5%"),
        borderRadius: 8,
        alignItems: "center",
        marginTop: hp("3%"),
        marginBottom: hp("3%"),

    },
    buttonText: {
        color: "#fff",
        fontSize: wp("4.5%"),
        fontWeight: "700"
    },
    subButton: {
        marginTop: hp(1.5),
        marginBottom: hp(1.5),
        backgroundColor: '#f0f0f0',
        paddingVertical: hp(1.5),
        borderRadius: wp(2),
        alignItems: 'center',
    },
    subButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: wp(4),
    },
    completeMessageContainer: {
        marginTop: hp(0.5),
        marginBottom: hp(0.5),
        alignItems: 'center',
        paddingVertical: hp(0.5),
    },
    completeMessageText: {
        color: '#003366',
        fontSize: wp(4),
        fontWeight: '600',
    },
});
