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
    장애등급: 'disabilityGrade',
    장애유형: 'disabilityTypes',
    보조기기사용여부: 'assistiveDevices',
    직무분야: 'jobInterest',
    근무가능형태: 'preferredWorkType',
};

// 대분류 -> 소분류 값 매핑
const personalizedMap = {
    장애등급: ['심한 장애', '심하지 않은 장애', '정보 없음'],
    장애유형: ['시각 장애', '청각 장애', '지체 장애', '지적 장애', '언어 장애', '신장 장애', '호흡기 장애', '기타'],
    보조기기사용여부: ['휠체어 사용', '보청기 사용', '점자 사용', '지팡이 사용', '보조공학기기 사용', '없음'],
    직무분야: ['사무보조', '디자인', 'IT/프로그래밍', '제조/생산', '상담/고객 응대', '번역/통역', '교육/강의', '마케팅/홍보', '기타'],
    근무가능형태: ['재택근무 가능', '사무실 출근 가능', '파트타임 선호', '풀타임 선호', '시간제 가능'],
};

export default function FilterTabSection({ filterStorageKey, onApply }) {


    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('');
    const [fromConditionMenu, setFromConditionMenu] = useState(false);

    // 각 필터 상태들
    const [selectedJob, setSelectedJob] = useState('식음료외식');
    const [selectedSubJob, setSelectedSubJob] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('전국');
    const [selectedSubRegion, setSelectedSubRegion] = useState([]);
    const [selectedCareer, setSelectedCareer] = useState('신입');
    const [selectedSubCareer, setSelectedSubCareer] = useState([]);
    const [selectedSubEducation, setSelectedSubEducation] = useState([]);
    const [selectedSubCompanyType, setSelectedSubCompanyType] = useState([]);
    const [selectedSubEmploymentType, setSelectedSubEmploymentType] = useState([]);
    const [selectedPersonalized, setSelectedPersonalized] = useState('장애등급');
    const [selectedSubPersonalized, setSelectedSubPersonalized] = useState([]);


    const [userInfo, setUserInfo] = useState(null);
    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('userInfo');
                if (jsonValue != null) {
                    const parsed = JSON.parse(jsonValue);
                    setUserInfo(parsed);
                }
            } catch (e) {
                console.error('userInfo 불러오기 실패', e);
            }
        };

        loadUserInfo();
    }, []);

    const openModal = (label) => {
        setSelectedFilter(label);
        setModalVisible(true);
        setFromConditionMenu(false);
    };

    const closeModal = () => setModalVisible(false);

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

    const handleApply = () => {
        const filterParams = {
            job: selectedSubJob.length > 0 ? selectedSubJob : [],
            region: selectedSubRegion.length > 0 ? selectedSubRegion : [],
            career: selectedSubCareer.length > 0 ? selectedSubCareer : [],
            education: selectedSubEducation.length > 0 ? selectedSubEducation : [],
            companyType: selectedSubCompanyType.length > 0 ? selectedSubCompanyType : [],
            employmentType: selectedSubEmploymentType.length > 0 ? selectedSubEmploymentType : [],
            personalized: Object.keys(buildStructuredPersonalized()).length > 0 ? buildStructuredPersonalized() : {},
        };

        // JobListScreen으로 전달
        if (onApply) onApply(filterParams);

        setModalVisible(false);
    };


    const filterStateKey = userInfo
        ? `${userInfo.id}_${filterStorageKey || '@filterState_default'}`
        : '@filterState_guest';


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

    // 1) 컴포넌트 마운트 시 저장된 필터 불러오기
    useEffect(() => {
        if (!userInfo) return;

        const loadFilters = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem(filterStateKey);
                if (jsonValue != null) {
                    const savedFilters = JSON.parse(jsonValue);
                    setSelectedJob(savedFilters.selectedJob || '식음료외식');
                    setSelectedSubJob(savedFilters.selectedSubJob || []);
                    setSelectedRegion(savedFilters.selectedRegion || '전국');
                    setSelectedSubRegion(savedFilters.selectedSubRegion || []);
                    setSelectedCareer(savedFilters.selectedCareer || '신입');
                    setSelectedSubCareer(savedFilters.selectedSubCareer || []);
                    setSelectedSubEducation(savedFilters.selectedSubEducation || []);
                    setSelectedSubCompanyType(savedFilters.selectedSubCompanyType || []);
                    setSelectedSubEmploymentType(savedFilters.selectedSubEmploymentType || []);
                    setSelectedPersonalized(savedFilters.selectedPersonalized || '장애등급');
                    setSelectedSubPersonalized(savedFilters.selectedSubPersonalized || []);
                }
            } catch (e) {
                console.error('필터 상태 로드 실패', e);
            }
        };
        loadFilters();
    }, [userInfo, filterStateKey]);

    // 2) 필터 상태 변경 시마다 저장
    useEffect(() => {
        const saveFilters = async () => {
            try {
                const filterState = getCurrentFilterState();
                await AsyncStorage.setItem(filterStateKey, JSON.stringify(filterState));
            } catch (e) {
                console.error('필터 상태 저장 실패', e);
            }
        };

        saveFilters();
    }, [
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
        filterStateKey,
    ]);


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

                onReset={() => {
                    if (selectedFilter === '조건추가') {
                        // 전체 초기화
                        setSelectedJob('식음료외식');
                        setSelectedSubJob([]);
                        setSelectedRegion('전국');
                        setSelectedSubRegion([]);
                        setSelectedCareer('신입');
                        setSelectedSubCareer([]);
                        setSelectedSubEducation([]);
                        setSelectedSubCompanyType([]);
                        setSelectedSubEmploymentType([]);
                        setSelectedPersonalized('장애등급');
                        setSelectedSubPersonalized([]);
                    } else {
                        switch (selectedFilter) {
                            case '직무':
                                setSelectedJob('식음료외식');
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
                                setSelectedPersonalized('장애등급');
                                setSelectedSubPersonalized([]);
                                break;
                            default:
                                break;
                        }
                    }
                }}

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
