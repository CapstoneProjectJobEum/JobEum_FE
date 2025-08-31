import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import * as ImagePicker from 'expo-image-picker';
import BottomSpacer from '../../../navigation/BottomSpacer';
import { FontAwesome } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';
import FilterModal from '../../features/FilterModal';

const personalizedKeyMap = {
    장애등급: 'disabilityGrade',
    장애유형: 'disabilityTypes',
    보조기기사용여부: 'assistiveDevices',
    직무분야: 'jobInterest',
    근무가능형태: 'preferredWorkType',
};

const personalizedMap = {
    장애등급: ['심한 장애', '심하지 않은 장애', '정보 없음'],
    장애유형: [
        '시각 장애', '청각 장애', '지체 장애', '지적 장애',
        '뇌병변 장애', '언어 장애', '신장 장애', '심장 장애',
        '간질(뇌전증) 장애', '호흡기 장애', '정신 장애', '기타'
    ],
    보조기기사용여부: [
        '휠체어 사용', '보청기 사용', '점자 사용', '지팡이 사용',
        '보조공학기기 사용', '수화 통역 지원 필요', '별도 휴식시간 필요',
        '작업환경 조정 필요', '없음'
    ],
    직무분야: [
        '사무 · 행정', '회계 · 재무', 'IT · 개발', '디자인 · 편집',
        '제조 · 생산 · 단순노무', '상담 · 고객지원', '번역 · 통역',
        '교육 · 강의', '마케팅 · 홍보', '영업 · 판매', '연구 · 엔지니어링',
        '농업 · 환경', '문화 · 예술 · 체육', '기타'
    ],
    근무가능형태: [
        '재택근무 가능', '사무실 출근 가능', '파트타임 선호',
        '풀타임 선호', '시간제 가능', '유연근무 가능',
        '장애인 전용 채용', '일반 채용 참여 희망'
    ],
};

export default function EditJobScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params || {};

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            title: '',
            company: '',
            location: '',
            deadline: '',
            detail: '',
            summary: '',
            working_conditions: '',
        },
    });


    // 필터 모달 상태
    const [selectedFilter, setSelectedFilter] = useState('조건추가');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterTitle, setFilterTitle] = useState('조건추가');
    const [fromConditionMenu, setFromConditionMenu] = useState(true);


    const [personalized, setPersonalized] = useState(null);
    // 필터 조건 상태 (초기값)
    const [filters, setFilters] = useState({
        selectedJob: '식음료외식',
        selectedSubJob: [],
        selectedRegion: '전국',
        selectedSubRegion: [],
        selectedCareer: '신입',
        selectedSubCareer: [],
        selectedSubEducation: [],
        selectedSubCompanyType: [],
        selectedSubEmploymentType: [],
        selectedPersonalized: '장애등급',
        selectedSubPersonalized: [],
    });


    const buildFilterParams = (filters) => {
        // personalized 구조 생성
        const personalized = {};
        Object.entries(personalizedMap).forEach(([korKey, values]) => {
            const matched = values.filter(item => filters.selectedSubPersonalized.includes(item));
            if (matched.length > 0) {
                const engKey = personalizedKeyMap[korKey];
                personalized[engKey] = matched;
            }
        });

        return {
            career: filters.selectedSubCareer.length > 0 ? filters.selectedSubCareer : (filters.selectedCareer ? [filters.selectedCareer] : []),
            companyType: filters.selectedSubCompanyType,
            education: filters.selectedSubEducation,
            employmentType: filters.selectedSubEmploymentType,
            job: filters.selectedSubJob.length > 0 ? filters.selectedSubJob : (filters.selectedJob ? [filters.selectedJob] : []),
            personalized: personalized,
            region: filters.selectedSubRegion.length > 0 ? filters.selectedSubRegion : (filters.selectedRegion ? [filters.selectedRegion] : []),
        };
    };

    const [images, setImages] = useState([]);
    const [showSetComplete, setShowSetComplete] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const userInfoStr = await AsyncStorage.getItem('userInfo');
                const token = await AsyncStorage.getItem('accessToken');
                if (!userInfoStr || !token) return;

                const parsed = JSON.parse(userInfoStr);
                setUserId(parsed.id);  // userId도 여기서 세팅

                const headers = { Authorization: `Bearer ${token}` };

                // 회사명 가져오기
                const resUser = await axios.get(`${BASE_URL}/api/account-info/${parsed.id}`, { headers });
                const companyName = resUser.data.company || '';

                // 회사 위치 가져오기
                const resProfile = await axios.get(`${BASE_URL}/api/company-profile/${parsed.id}`, { headers });
                const companyLocation = resProfile.data.location || '';

                reset(prev => ({
                    ...prev,
                    company: companyName,
                    location: companyLocation,
                }));
            } catch (error) {
                console.error('회사 정보 불러오기 실패', error);
            }
        };

        fetchCompanyData();
    }, [reset]);


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


    // 공고 상세 불러오기
    useEffect(() => {
        if (!id) return;

        const fetchJob = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/jobs/${id}`);
                const job = res.data;

                // "YYYY-MM-DD" → "YYYYMMDD" 변환
                const formattedDeadline = job.deadline ? job.deadline.replace(/-/g, '') : '';

                // 기본 텍스트 필드 초기화
                reset({
                    title: job.title || '',
                    deadline: formattedDeadline,
                    detail: job.detail || '',
                    summary: job.summary || '',
                    working_conditions: job.working_conditions || '',
                });

                // filters 세팅 (서버에서 내려오는 값 전체 반영)
                setFilters(prev => ({
                    selectedJob: prev.selectedJob,
                    selectedRegion: prev.selectedRegion,
                    selectedCareer: prev.selectedCareer,
                    selectedSubCareer: job.filters?.career || [],
                    selectedSubEducation: job.filters?.education || [],
                    selectedSubEmploymentType: job.filters?.employmentType || [],
                    selectedSubJob: job.filters?.job || [],
                    selectedSubRegion: job.filters?.region || [],
                    selectedSubCompanyType: job.filters?.companyType || [],
                    selectedSubPersonalized: job.personalized ? Object.values(job.personalized).flat() : [],
                    selectedPersonalized: prev.selectedPersonalized,
                }));

                // personalized 세팅 (서버에서 내려오는 객체 그대로)
                setPersonalized(job.personalized || {});

                setImages((job.images || []).map(url => ({ uri: url })));
                setShowSetComplete(Boolean(job.filters || job.personalized));
            } catch (error) {
                Alert.alert('불러오기 실패', '채용공고 정보를 불러오는 중 오류가 발생했습니다.');
                console.error(error);
            }
        };

        fetchJob();
    }, [id, reset]);



    // 사진 선택
    const handleSelectPhoto = async () => {
        if (images.length >= 4) {
            Alert.alert('사진은 최대 4장까지 등록 가능합니다.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const selectedUri = result.assets[0].uri;
            setImages(prev => [...prev, { uri: selectedUri }]);
        }
    };

    // 이미지 삭제
    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // 이미지 서버 업로드 함수 (로컬 URI만 업로드)
    const uploadImagesToServer = async (imageUris) => {
        const formData = new FormData();

        imageUris.forEach((uri) => {
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;
            formData.append('images', {
                uri,
                name: filename,
                type,
            });
        });

        const res = await axios.post(`${BASE_URL}/api/jobs/upload-images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (!res.data.success) {
            throw new Error('이미지 업로드 실패');
        }

        return res.data.imageUrls;
    };

    const requiredFilterKeys = [
        'selectedSubJob',
        'selectedSubRegion',
        'selectedSubCareer',
        'selectedSubEducation',
        'selectedSubCompanyType',
        'selectedSubEmploymentType',
        'selectedSubPersonalized',
    ];

    const validateFilters = (filters) => {
        for (const key of requiredFilterKeys) {
            if (!filters[key] || filters[key].length === 0) {
                return false;
            }
        }
        return true;
    };
    const validatePersonalized = (selectedSubPersonalized) => {
        for (const category of Object.keys(personalizedMap)) {
            const selectedInCategory = personalizedMap[category].filter(sub =>
                selectedSubPersonalized.includes(sub)
            );
            if (selectedInCategory.length === 0) {
                return false;
            }
        }
        return true;
    };

    // 제출 (수정) 함수
    const onSubmit = async (formData) => {
        if (!validateFilters(filters)) {
            alert('필수 필터를 모두 선택해 주세요.');
            return;
        }

        if (!validatePersonalized(filters.selectedSubPersonalized)) {
            alert('맞춤정보 각 항목별로 최소 1개 이상 선택해 주세요.');
            return;
        }
        if (!userId) {
            Alert.alert('사용자 정보가 없습니다. 다시 로그인 해주세요.');
            return;
        }
        if (!formData.title.trim() || !formData.company.trim()) {
            Alert.alert('입력 오류', '채용공고 제목과 회사명은 필수 입력 사항입니다.');
            return;
        }
        if (images.length === 0) {
            Alert.alert('입력 오류', '최소 1장의 사진을 등록해주세요.');
            return;
        }
        if (formData.deadline) {
            if (formData.deadline.length !== 8) {
                Alert.alert('입력 오류', '지원 마감일은 8자리 (YYYYMMDD) 형식으로 입력해주세요.');
                return;
            }

            const inputDate = new Date(
                parseInt(formData.deadline.slice(0, 4)),
                parseInt(formData.deadline.slice(4, 6)) - 1,
                parseInt(formData.deadline.slice(6, 8))
            );
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (inputDate < today) {
                Alert.alert('입력 오류', '마감일은 오늘 이후로 설정해야 합니다.');
                return;
            }
        }

        try {
            // 로컬 URI만 업로드
            const localUris = images.filter(img => !img.uri.startsWith('http')).map(img => img.uri);
            const uploadedImageUrls = localUris.length > 0 ? await uploadImagesToServer(localUris) : [];

            const filterParams = buildFilterParams(filters);

            // 기존 http URL과 새 업로드 URL 합치기
            const finalImageUrls = [
                ...images.filter(img => img.uri.startsWith('http')).map(img => img.uri),
                ...uploadedImageUrls,
            ];

            // deadline 포맷팅
            const d = formData.deadline;
            const formattedDeadline = d.length === 8
                ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
                : null;

            // 수정 API 호출 (PUT)
            const fullData = {
                user_id: userId,
                title: formData.title,
                company: formData.company,
                location: formData.location || null,
                deadline: formattedDeadline,
                detail: formData.detail || null,
                summary: formData.summary || null,
                working_conditions: formData.working_conditions || null,
                disability_requirements: filterParams,
                filters: { ...filterParams, personalized: undefined },
                personalized: filterParams.personalized || null,
                images: finalImageUrls,
            };

            const token = await AsyncStorage.getItem('accessToken');
            await axios.put(`${BASE_URL}/api/jobs/${id}`, fullData, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });


            Alert.alert('수정 완료', '채용공고가 성공적으로 수정되었습니다.');
            navigation.goBack();
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
                selectedSubCompanyType: [],
                selectedSubEmploymentType: [],
                selectedPersonalized: '장애등급',
                selectedSubPersonalized: [],
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
                case '기업형태':
                    setFilters(f => ({
                        ...f,
                        selectedSubCompanyType: [],
                    }));
                    break;
                case '고용형태':
                    setFilters(f => ({
                        ...f,
                        selectedSubEmploymentType: [],
                    }));
                    break;
                case '맞춤정보':
                    setFilters(f => ({
                        ...f,
                        selectedPersonalized: '장애등급',
                        selectedSubPersonalized: [],
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

    return (
        <>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    extraScrollHeight={5}
                >
                    <ScrollView style={{ backgroundColor: '#fff' }} contentContainerStyle={styles.container}>
                        <View style={styles.fieldWrapper}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>기업 정보</Text>
                                <Text style={styles.sectionNote}>
                                    ※ 수정은 계정 정보에서 가능합니다.
                                </Text>
                            </View>

                            <Controller
                                control={control}
                                name="company"
                                render={({ field }) => (
                                    <TextInput
                                        style={styles.readOnlyInput}
                                        value={field.value}
                                        editable={false}
                                        placeholder="회사명을 입력하세요"
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="location"
                                render={({ field }) => (
                                    <TextInput
                                        style={styles.readOnlyInput}
                                        value={field.value}
                                        editable={false}
                                        placeholder="예: 서울시 강남구"
                                    />
                                )}
                            />
                        </View>
                        {[
                            { name: 'title', label: '채용공고 제목 *', placeholder: '제목을 입력하세요' },
                            { name: 'deadline', label: '지원 마감일', placeholder: '예: YYYYMMDD' },
                            { name: 'detail', label: '채용 상세 내용', placeholder: '이런 업무를 해요', multiline: true },
                            { name: 'summary', label: '채용 조건 요약', placeholder: '이런 분들 찾고 있어요', multiline: true },
                            { name: 'working_conditions', label: '기타 조건', placeholder: '예: 복지, 근무 형태 등', multiline: true },
                        ].map(({ name, label, placeholder, multiline, editable = true }) => (
                            <View key={name}>
                                <Text style={styles.label}>{label}</Text>
                                <Controller
                                    control={control}
                                    name={name}
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                multiline && styles.textArea,
                                            ]}
                                            placeholder={placeholder}
                                            value={value}
                                            onChangeText={onChange}
                                            multiline={multiline}
                                            scrollEnabled={multiline}
                                            showsVerticalScrollIndicator={multiline}
                                            editable={editable}
                                        />
                                    )}
                                />
                            </View>
                        ))}

                        <TouchableOpacity
                            style={[styles.subButton, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: hp(2) }]}
                            onPress={handleSelectPhoto}
                        >
                            <FontAwesome name="image" size={wp(5)} color="#333" />
                            <Text style={[styles.subButtonText, { marginLeft: wp(2) }]}>회사 사진 등록하기  ({images.length}/4)</Text>
                        </TouchableOpacity>

                        <View style={styles.imagePreviewContainer}>
                            {images.map((image, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri: image.uri }} style={styles.imageBox} />
                                    <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeBtn}>
                                        <FontAwesome name="close" size={12} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.subButton}
                            onPress={handleSetCondition}
                        >
                            <Text style={styles.subButtonText}>채용 조건 설정하기</Text>
                        </TouchableOpacity>

                        {showSetComplete && (
                            <View style={styles.completeMessageContainer}>
                                <Text style={styles.completeMessageText}>채용 조건이 설정되었습니다.</Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                            <Text style={styles.buttonText}>수정하기</Text>
                        </TouchableOpacity>

                        <BottomSpacer />
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
                        selectedSubCompanyType={filters.selectedSubCompanyType}
                        setSelectedSubCompanyType={(val) => setFilters(f => ({ ...f, selectedSubCompanyType: val }))}
                        selectedSubEmploymentType={filters.selectedSubEmploymentType}
                        setSelectedSubEmploymentType={(val) => setFilters(f => ({ ...f, selectedSubEmploymentType: val }))}
                        selectedPersonalized={filters.selectedPersonalized}
                        setSelectedPersonalized={(val) => setFilters(f => ({ ...f, selectedPersonalized: val }))}
                        selectedSubPersonalized={filters.selectedSubPersonalized}
                        setSelectedSubPersonalized={(val) => setFilters(f => ({ ...f, selectedSubPersonalized: val }))}
                    />
                </KeyboardAwareScrollView>
            </SafeAreaView>
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
        fontSize: wp(4),
        fontWeight: '600',
        marginBottom: hp(0.8),
        marginTop: hp(1.5),
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: wp(1.5),
        paddingHorizontal: wp(3),
        paddingVertical: hp(1.2),
        fontSize: wp(4),
        backgroundColor: '#fafafa',
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
        height: hp(12),
        textAlignVertical: 'top',
    },
    button: {
        marginTop: hp(4),
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: hp(1.8),
        borderRadius: wp(2),
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: wp(5),
        fontWeight: '700',
    },
    subButton: {
        marginTop: hp(1.5),
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
    imagePreviewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: hp('2%'),
        marginHorizontal: wp('5%'),
    },
    imageWrapper: {
        marginRight: wp('2%'),
        marginBottom: wp('2%'),
    },
    imageBox: {
        width: wp('18%'),
        height: wp('18%'),
        borderRadius: 8,
    },
    removeBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 10,
        padding: 3,
    },
    completeMessageContainer: {
        marginTop: hp(0.5),
        alignItems: 'center',
        paddingVertical: hp(0.5),
    },
    completeMessageText: {
        color: '#003366',
        fontSize: wp(4),
        fontWeight: '600',
    },
});
