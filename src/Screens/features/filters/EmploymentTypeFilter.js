import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';

const employmentTypeList = [
    '정규직',
    '계약직',
    '인턴',
    '아르바이트',
    '시간제 · 단시간',
    '파견직',
    '프리랜서',
    '연수생 · 교육생'
];

export default function EmploymentTypeFilter({ selectedSubEmploymentType, setSelectedSubEmploymentType }) {


    const toggleSubEmploymentType = (subEmploymentType) => {
        if (selectedSubEmploymentType.includes(subEmploymentType)) {
            setSelectedSubEmploymentType(selectedSubEmploymentType.filter((item) => item !== subEmploymentType));
        } else {
            setSelectedSubEmploymentType([...selectedSubEmploymentType, subEmploymentType]);
        }
    };

    const removeSubEmploymentType = (subEmploymentType) => {
        setSelectedSubEmploymentType(selectedSubEmploymentType.filter((item) => item !== subEmploymentType));
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.listContainer}>
                {employmentTypeList.map((subEmploymentType) => {
                    const selected = selectedSubEmploymentType.includes(subEmploymentType);
                    return (
                        <TouchableOpacity
                            key={subEmploymentType}
                            style={[
                                styles.itemBox,
                                selected && { borderColor: COLORS.THEMECOLOR },
                            ]}
                            onPress={() => toggleSubEmploymentType(subEmploymentType)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.itemText, selected && { color: COLORS.THEMECOLOR, fontWeight: 'bold' }]}>
                                {subEmploymentType}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {selectedSubEmploymentType.length > 0 && (
                <View style={styles.selectedSubEmploymentTypeContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.selectedSubEmploymentTypeContent}
                    >
                        {selectedSubEmploymentType.map((subEmploymentType) => (
                            <View key={subEmploymentType} style={styles.selectedSubEmploymentTypeCard}>
                                <Text style={styles.selectedSubEmploymentTypeText}>{subEmploymentType}</Text>
                                <TouchableOpacity onPress={() => removeSubEmploymentType(subEmploymentType)}>
                                    <Ionicons name="close" size={16} color="#999" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: hp(2),
    },
    listContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: wp(2),
    },
    itemBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: wp(2),
        paddingVertical: hp(1),
        paddingHorizontal: wp(3),
        alignItems: 'center',
        marginRight: wp('2%'),
        marginBottom: wp('2%'),
    },
    itemText: {
        fontSize: wp(3.5),
        color: '#333',
    },
    selectedSubEmploymentTypeContainer: {
        borderTopWidth: 1,
        borderColor: '#ddd',
        paddingVertical: hp(1),
        paddingHorizontal: wp(2),
    },
    selectedSubEmploymentTypeContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedSubEmploymentTypeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: wp(2),
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        marginRight: wp(2),
    },
    selectedSubEmploymentTypeText: {
        color: '#333',
        fontSize: wp(3.5),
        marginRight: wp(1.5),
    },
});
