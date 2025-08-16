import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import COLORS from '../../../constants/colors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Ionicons from '@expo/vector-icons/Ionicons';

const educationList = [
    '고등학교 졸업',
    '대학졸업(2,3년)',
    '대학졸업(4년)',
    '대학원 석사졸업',
    '대학원 박사졸업',
    '학력무관',
];

export default function EducationFilter({ selectedSubEducation, setSelectedSubEducation, excludeEducation = [] }) {

    const toggleSubEducation = (subEducation) => {
        if (selectedSubEducation.includes(subEducation)) {
            setSelectedSubEducation(selectedSubEducation.filter((item) => item !== subEducation));
        } else {
            setSelectedSubEducation([...selectedSubEducation, subEducation]);
        }
    };

    const removesubEducation = (subEducation) => {
        setSelectedSubEducation(selectedSubEducation.filter((item) => item !== subEducation));
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.listContainer}>
                {educationList
                    .filter(item => !excludeEducation.includes(item)) // ← 제외 처리
                    .map((subEducation) => {
                        const selected = selectedSubEducation.includes(subEducation);
                        return (
                            <TouchableOpacity
                                key={subEducation}
                                style={[
                                    styles.itemBox,
                                    selected && { borderColor: COLORS.THEMECOLOR },
                                ]}
                                onPress={() => toggleSubEducation(subEducation)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.itemText, selected && { color: COLORS.THEMECOLOR, fontWeight: 'bold' }]}>
                                    {subEducation}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
            </ScrollView>

            {selectedSubEducation.length > 0 && (
                <View style={styles.selectedSubEducationContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.selectedSubEducationContent}
                    >
                        {selectedSubEducation.map((subEducation) => (
                            <View key={subEducation} style={styles.selectedSubEducationCard}>
                                <Text style={styles.selectedSubEducationText}>{subEducation}</Text>
                                <TouchableOpacity onPress={() => removesubEducation(subEducation)}>
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
        gap: wp(2),
        paddingHorizontal: wp(2),
    },
    itemBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: wp(2),
        paddingVertical: hp(1),
        paddingHorizontal: wp(3),
        alignItems: 'center',
    },
    itemText: {
        fontSize: wp(3.5),
        color: '#333',
    },
    selectedSubEducationContainer: {
        borderTopWidth: 1,
        borderColor: '#ddd',
        paddingVertical: hp(1),
        paddingHorizontal: wp(2),
    },
    selectedSubEducationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    selectedSubEducationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: wp(2),
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        marginRight: wp(2),
    },
    selectedSubEducationText: {
        color: '#333',
        fontSize: wp(3.5),
        marginRight: wp(1.5),
    },
});
