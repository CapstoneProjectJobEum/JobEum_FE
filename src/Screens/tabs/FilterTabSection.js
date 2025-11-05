import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from "../../constants/colors";
import { Ionicons, Feather } from '@expo/vector-icons';
import FilterModal from '../features/FilterModal';

const buttonData = ['직무', '지역', '경력', '학력', '기업형태', '고용형태', '맞춤정보'];

// 대분류 -> 영문 키 매핑
const personalizedKeyMap = {
    장애정도: 'disabilityGrade',
    장애유형: 'disabilityTypes',
    보조기기및환경: 'assistiveDevices',
    직무분야: 'jobInterest',
    근무가능형태: 'preferredWorkType',
};

// 대분류 -> 소분류 값 매핑
const personalizedMap = {
    장애정도: ['심한 장애', '심하지 않은 장애', '미등록'],
    장애유형: [
        '지체장애', '뇌병변장애', '시각장애', '청각장애',
        '언어장애', '지적장애', '자폐성 장애', '기타 내부기관 장애'
    ],
    보조기기및환경: [
        '이동 보조', '시각 보조', '청각‧소통 보조', '컴퓨터‧입력 보조',
        '일상생활 보조', '별도 휴식시간 필요', '작업환경 조정 필요'
    ],
    직무분야: [
        'SW‧앱 개발', '웹‧디자인', '경영‧사무', '데이터‧QA', '고객 상담',
        '마케팅‧홍보', '헬스‧복지', '제조‧생산', '예술‧창작', '교육‧지원'
    ],
    근무가능형태: [
        '재택‧원격 근무', '전일제', '시간제', '유연 근무',
        '근로지원인 필요', '장애인 전용 채용 선호', '일반 채용 참여 희망'
    ],
};

export default function FilterTabSection({ filterStorageKey, onApply, openFilterProp }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('');
    const [fromConditionMenu, setFromConditionMenu] = useState(false);

    useEffect(() => {
        if (openFilterProp) {
            setSelectedFilter(openFilterProp);
            setModalVisible(true);
        }
    }, [openFilterProp]);

    // 각 필터 상태들
    const [selectedJob, setSelectedJob] = useState('SW앱개발');
    const [selectedSubJob, setSelectedSubJob] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('전국');
    const [selectedSubRegion, setSelectedSubRegion] = useState([]);
    const [selectedCareer, setSelectedCareer] = useState('신입');
    const [selectedSubCareer, setSelectedSubCareer] = useState([]);
    const [selectedSubEducation, setSelectedSubEducation] = useState([]);
    const [selectedSubCompanyType, setSelectedSubCompanyType] = useState([]);
    const [selectedSubEmploymentType, setSelectedSubEmploymentType] = useState([]);
    const [selectedPersonalized, setSelectedPersonalized] = useState('장애정도');
    const [selectedSubPersonalized, setSelectedSubPersonalized] = useState([]);

    const [myUserId, setMyUserId] = useState(null);

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

    const filterStateKey = filterStorageKey && myUserId
        ? `${filterStorageKey}_${myUserId}`
        : null;


    useEffect(() => {
        if (!filterStateKey) return;

        const loadFilters = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem(filterStateKey);
                if (jsonValue != null) {
                    const savedFilters = JSON.parse(jsonValue);
                    setSelectedJob(savedFilters.selectedJob || 'SW앱개발');
                    setSelectedSubJob(savedFilters.selectedSubJob || []);
                    setSelectedRegion(savedFilters.selectedRegion || '전국');
                    setSelectedSubRegion(savedFilters.selectedSubRegion || []);
                    setSelectedCareer(savedFilters.selectedCareer || '신입');
                    setSelectedSubCareer(savedFilters.selectedSubCareer || []);
                    setSelectedSubEducation(savedFilters.selectedSubEducation || []);
                    setSelectedSubCompanyType(savedFilters.selectedSubCompanyType || []);
                    setSelectedSubEmploymentType(savedFilters.selectedSubEmploymentType || []);
                    setSelectedPersonalized(savedFilters.selectedPersonalized || '장애정도');
                    setSelectedSubPersonalized(savedFilters.selectedSubPersonalized || []);

                    onApply && onApply({
                        job: savedFilters.selectedSubJob || [],
                        region: savedFilters.selectedSubRegion || [],
                        career: savedFilters.selectedSubCareer || [],
                        education: savedFilters.selectedSubEducation || [],
                        companyType: savedFilters.selectedSubCompanyType || [],
                        employmentType: savedFilters.selectedSubEmploymentType || [],
                        personalized: savedFilters.selectedSubPersonalized?.length
                            ? buildStructuredPersonalized(savedFilters.selectedSubPersonalized)
                            : {},
                    });
                }
            } catch (e) {
                console.error('필터 상태 로드 실패', e);
            }
        };
        loadFilters();
    }, [filterStateKey]);


    const openModal = (label) => {
        setSelectedFilter(label);
        setModalVisible(true);
        setFromConditionMenu(false);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const onSelectFilterFromMenu = (filterName) => {
        setSelectedFilter(filterName);
        setFromConditionMenu(true);
    };

    const hasSelection = (label) => {
        if (label === '직무') return selectedSubJob.length > 0;
        if (label === '지역') return selectedSubRegion.length > 0;
        if (label === '경력') return selectedSubCareer.length > 0;
        if (label === '학력') return selectedSubEducation.length > 0;
        if (label === '기업형태') return selectedSubCompanyType.length > 0;
        if (label === '고용형태') return selectedSubEmploymentType.length > 0;
        if (label === '맞춤정보') return selectedSubPersonalized.length > 0;
        return false;
    };

    // personalized 필터를 대분류 -> 소분류 구조로 구성
    const buildStructuredPersonalized = () => {
        const structured = {};
        Object.entries(personalizedMap).forEach(([korKey, values]) => {
            const matched = values.filter(item => selectedSubPersonalized.includes(item));
            if (matched.length > 0) {
                const engKey = personalizedKeyMap[korKey];
                structured[engKey] = matched;
            }
        });
        return structured;
    };

    const handleApply = async () => {
        // 1. AsyncStorage에 현재 필터 상태를 저장합니다.
        try {
            const filterState = getCurrentFilterState();
            await AsyncStorage.setItem(filterStateKey, JSON.stringify(filterState));
            console.log("필터 상태 저장 완료");
        } catch (e) {
            console.error('필터 상태 저장 실패', e);
        }

        // 2. onApply prop을 호출하여 화면에 변경된 필터를 적용합니다.
        const filterParams = {
            job: selectedSubJob.length > 0 ? selectedSubJob : [],
            region: selectedSubRegion.length > 0 ? selectedSubRegion : [],
            career: selectedSubCareer.length > 0 ? selectedSubCareer : [],
            education: selectedSubEducation.length > 0 ? selectedSubEducation : [],
            companyType: selectedSubCompanyType.length > 0 ? selectedSubCompanyType : [],
            employmentType: selectedSubEmploymentType.length > 0 ? selectedSubEmploymentType : [],
            personalized: Object.keys(buildStructuredPersonalized()).length > 0 ? buildStructuredPersonalized() : {},
        };

        if (onApply) onApply(filterParams);

        // 3. 모달을 닫습니다.
        setModalVisible(false);
    };

    const handleReset = () => {
        if (selectedFilter === '조건추가') {
            // 전체 초기화
            setSelectedJob('SW앱개발');
            setSelectedSubJob([]);
            setSelectedRegion('전국');
            setSelectedSubRegion([]);
            setSelectedCareer('신입');
            setSelectedSubCareer([]);
            setSelectedSubEducation([]);
            setSelectedSubCompanyType([]);
            setSelectedSubEmploymentType([]);
            setSelectedPersonalized('장애정도');
            setSelectedSubPersonalized([]);
        } else {
            switch (selectedFilter) {
                case '직무':
                    setSelectedJob('SW앱개발');
                    setSelectedSubJob([]);
                    break;
                case '지역':
                    setSelectedRegion('전국');
                    setSelectedSubRegion([]);
                    break;
                case '경력':
                    setSelectedCareer('신입');
                    setSelectedSubCareer([]);
                    break;
                case '학력':
                    setSelectedSubEducation([]);
                    break;
                case '기업형태':
                    setSelectedSubCompanyType([]);
                    break;
                case '고용형태':
                    setSelectedSubEmploymentType([]);
                    break;
                case '맞춤정보':
                    setSelectedPersonalized('장애정도');
                    setSelectedSubPersonalized([]);
                    break;
                default:
                    break;
            }
        }
    };

    const handleRevert = async () => {
        try {
            // AsyncStorage에서 마지막으로 저장된 필터 상태를 불러옵니다.
            const jsonValue = await AsyncStorage.getItem(filterStateKey);

            if (jsonValue != null) {
                const savedFilters = JSON.parse(jsonValue);

                // 불러온 값으로 모든 상태를 복원합니다.
                setSelectedJob(savedFilters.selectedJob || 'SW앱개발');
                setSelectedSubJob(savedFilters.selectedSubJob || []);
                setSelectedRegion(savedFilters.selectedRegion || '전국');
                setSelectedSubRegion(savedFilters.selectedSubRegion || []);
                setSelectedCareer(savedFilters.selectedCareer || '신입');
                setSelectedSubCareer(savedFilters.selectedSubCareer || []);
                setSelectedSubEducation(savedFilters.selectedSubEducation || []);
                setSelectedSubCompanyType(savedFilters.selectedSubCompanyType || []);
                setSelectedSubEmploymentType(savedFilters.selectedSubEmploymentType || []);
                setSelectedPersonalized(savedFilters.selectedPersonalized || '장애정도');
                setSelectedSubPersonalized(savedFilters.selectedSubPersonalized || []);

                // 복원된 값으로 onApply를 호출하여 화면에 즉시 적용합니다.
                onApply && onApply({
                    job: savedFilters.selectedSubJob || [],
                    region: savedFilters.selectedSubRegion || [],
                    career: savedFilters.selectedSubCareer || [],
                    education: savedFilters.selectedSubEducation || [],
                    companyType: savedFilters.selectedSubCompanyType || [],
                    employmentType: savedFilters.selectedSubEmploymentType || [],
                    personalized: savedFilters.selectedSubPersonalized?.length
                        ? buildStructuredPersonalized(savedFilters.selectedSubPersonalized)
                        : {},
                });
            }
        } catch (e) {
            console.error('필터 상태 복원 실패', e);
        }

        closeModal();
    };


    const getCurrentFilterState = () => ({
        selectedJob,
        selectedSubJob,
        selectedRegion,
        selectedSubRegion,
        selectedCareer,
        selectedSubCareer,
        selectedSubEducation,
        selectedSubCompanyType,
        selectedSubEmploymentType,
        selectedPersonalized,
        selectedSubPersonalized,
    });

    return (
        <>
            <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
                <View style={styles.fixedBar}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalBarContent}
                    >
                        {buttonData.map(label => (
                            <TouchableOpacity
                                key={label}
                                style={[
                                    styles.scrollButton,
                                    hasSelection(label) && { borderColor: COLORS.THEMECOLOR, borderWidth: 1 }
                                ]}
                                onPress={() => openModal(label)}
                            >
                                <View style={styles.iconTextRow}>
                                    <Text
                                        style={[
                                            styles.scrollButtonText,
                                            hasSelection(label) && { color: COLORS.THEMECOLOR, fontWeight: 'bold' }
                                        ]}
                                    >
                                        {label}
                                    </Text>
                                    <Ionicons
                                        name="chevron-down"
                                        size={wp('4%')}
                                        color={hasSelection(label) ? COLORS.THEMECOLOR : '#999'}
                                        style={{ marginLeft: 4 }}
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity style={styles.filterButton} onPress={() => openModal('조건추가')}>
                        <Feather name="filter" size={wp('4.2%')} color="black" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <FilterModal
                visible={modalVisible}
                onClose={closeModal}
                title={selectedFilter}
                fromConditionMenu={fromConditionMenu}
                setFromConditionMenu={setFromConditionMenu}

                selectedJob={selectedJob}
                setSelectedJob={setSelectedJob}
                selectedSubJob={selectedSubJob}
                setSelectedSubJob={setSelectedSubJob}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                selectedSubRegion={selectedSubRegion}
                setSelectedSubRegion={setSelectedSubRegion}
                selectedCareer={selectedCareer}
                setSelectedCareer={setSelectedCareer}
                selectedSubCareer={selectedSubCareer}
                setSelectedSubCareer={setSelectedSubCareer}
                selectedSubEducation={selectedSubEducation}
                setSelectedSubEducation={setSelectedSubEducation}
                selectedSubCompanyType={selectedSubCompanyType}
                setSelectedSubCompanyType={setSelectedSubCompanyType}
                selectedSubEmploymentType={selectedSubEmploymentType}
                setSelectedSubEmploymentType={setSelectedSubEmploymentType}
                selectedPersonalized={selectedPersonalized}
                setSelectedPersonalized={setSelectedPersonalized}
                selectedSubPersonalized={selectedSubPersonalized}
                setSelectedSubPersonalized={setSelectedSubPersonalized}

                onRevert={handleRevert}
                onReset={handleReset}
                onApply={handleApply}
                onSelectFilterFromMenu={onSelectFilterFromMenu}
            />
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#fff'
    },
    fixedBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: hp('1%'),
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingHorizontal: wp('5%'),
        zIndex: 10,
    },
    iconTextRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    horizontalBarContent: {
        flexDirection: 'row'
    },
    scrollButton: {
        marginRight: wp('3%'),
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1%'),
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    scrollButtonText: {
        fontSize: wp('3.5%'),
        color: 'black'
    },
    filterButton: {
        borderRadius: 25,
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
});
