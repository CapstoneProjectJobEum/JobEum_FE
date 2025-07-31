import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import COLORS from "../../constants/colors";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FilterModal from '../features/FilterModal';

const buttonData = ['직무', '지역', '경력', '학력', '기업형태', '고용형태', '맞춤정보'];

export default function FilterTabSection() {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('');
    const [fromConditionMenu, setFromConditionMenu] = useState(false); // 추가

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
    const [selectedPersonalized, setSelectedPersonalized] = useState('장애유형');
    const [selectedSubPersonalized, setSelectedSubPersonalized] = useState([]);

    const openModal = (label) => {
        setSelectedFilter(label);
        setModalVisible(true);
        setFromConditionMenu(false); // 바로 다른 필터를 눌렀을 때 false
    };

    const closeModal = () => setModalVisible(false);

    const onSelectFilterFromMenu = (filterName) => {
        setSelectedFilter(filterName);
        setFromConditionMenu(true); // 조건추가 메뉴에서 들어왔을 때 true
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

    return (
        <>
            <SafeAreaView style={styles.safeArea}>
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
                                        size={16}
                                        color={hasSelection(label) ? COLORS.THEMECOLOR : '#999'}
                                        style={{ marginLeft: 4 }}
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity style={styles.filterButton} onPress={() => openModal('조건추가')}>
                        <Feather name="filter" size={18} color="black" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <FilterModal
                visible={modalVisible}
                onClose={closeModal}
                title={selectedFilter}
                fromConditionMenu={fromConditionMenu} // 추가
                setFromConditionMenu={setFromConditionMenu} // 추가

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
                    setSelectedJob('식음료외식');
                    setSelectedSubJob([]);
                    setSelectedRegion('전국');
                    setSelectedSubRegion([]);
                    setSelectedCareer('신입');
                    setSelectedSubCareer([]);
                    setSelectedSubEducation([]);
                    setSelectedSubCompanyType([]);
                    setSelectedSubEmploymentType([]);
                    setSelectedPersonalized('장애유형');
                    setSelectedSubPersonalized([]);
                }}
                onApply={() => {
                    console.log('선택된 직무:', selectedJob, selectedSubJob);
                    console.log('선택된 지역:', selectedRegion, selectedSubRegion);
                    console.log('선택된 경력:', selectedCareer, selectedSubCareer);
                    console.log('선택된 학력:', selectedSubEducation);
                    console.log('선택된 기업형태:', selectedSubCompanyType);
                    console.log('선택된 고용형태:', selectedSubEmploymentType);
                    console.log('선택된 맞춤정보:', selectedPersonalized, selectedSubPersonalized);
                    setModalVisible(false);
                }}
                onSelectFilterFromMenu={onSelectFilterFromMenu}
            />
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#fff' },
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
    iconTextRow: { flexDirection: 'row', alignItems: 'center' },
    horizontalBarContent: { flexDirection: 'row' },
    scrollButton: {
        marginRight: wp('3%'),
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1%'),
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    scrollButtonText: { fontSize: wp('3.5%'), color: 'black' },
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
