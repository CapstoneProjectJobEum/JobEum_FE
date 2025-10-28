import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';

export default function FilterMenuScreen({
    onClose,
    onSelectFilter,
    selectedSubJob = [],
    selectedSubRegion = [],
    selectedSubCareer = [],
    selectedSubEducation = [],
    selectedSubCompanyType = [],
    selectedSubEmploymentType = [],
    selectedSubPersonalized = [],
    hideOptions = false,
}) {

    const filterOptions = hideOptions
        ? ['직무', '지역', '고용형태']
        : ['직무', '지역', '경력', '학력', '기업형태', '고용형태', '맞춤정보'];
    const handlePress = (option) => {
        onSelectFilter(option);
    };

    // 선택 여부 판단 함수
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
        <ScrollView contentContainerStyle={styles.container}>
            {filterOptions.map((option, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.optionButton}
                    onPress={() => handlePress(option)}
                >
                    <View style={styles.leftSection}>
                        <Text
                            style={[
                                styles.optionText,
                                hasSelection(option) && { color: COLORS.THEMECOLOR },
                            ]}
                        >
                            {option}
                        </Text>
                    </View>
                    <View style={styles.rightSection}>
                        <Ionicons name="chevron-forward" size={wp('5.5%')} color="black" />
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        backgroundColor: '#fff',
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: hp('1.6%'),
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    leftSection: {
        flex: 1,
        justifyContent: 'center',
    },
    rightSection: {
        width: wp('8%'),
        alignItems: 'flex-end',
    },
    optionText: {
        fontSize: wp('4%'),
        color: '#333',
    },
});
