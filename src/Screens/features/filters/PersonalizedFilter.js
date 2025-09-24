import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';

const personalizedMap = {
    장애유형: ['시각 장애', '청각 장애', '지체 장애', '지적 장애', '언어 장애', '신장 장애', '호흡기 장애', '기타'],
    장애등급: ['심한 장애', '심하지 않은 장애', '정보 없음'],
    보조기기사용여부: ['휠체어 사용', '보청기 사용', '점자 사용', '지팡이 사용', '보조공학기기 사용', '없음'],
    직무분야: ['사무보조', '디자인', 'IT/프로그래밍', '제조/생산', '상담/고객 응대', '번역/통역', '교육/강의', '마케팅/홍보', '기타'],
    근무가능형태: ['재택근무 가능', '사무실 출근 가능', '파트타임 선호', '풀타임 선호', '시간제 가능'],
};

export default function PersonalizedFilter({ selectedPersonalized, setSelectedPersonalized, selectedSubPersonalized, setSelectedSubPersonalized }) {

    const toggleSubPersonalized = (subPersonalized) => {
        if (selectedSubPersonalized.includes(subPersonalized)) {
            setSelectedSubPersonalized(selectedSubPersonalized.filter((item) => item !== subPersonalized));
        } else {
            setSelectedSubPersonalized([...selectedSubPersonalized, subPersonalized]);
        }
    };

    const removeSubPersonalized = (subPersonalized) => {
        setSelectedSubPersonalized(selectedSubPersonalized.filter((item) => item !== subPersonalized));
    };


    return (
        <View style={styles.container}>
            <View style={styles.regionWrapper}>
                <ScrollView style={styles.leftColumn}>
                    {Object.keys(personalizedMap).map((region) => (
                        <TouchableOpacity
                            key={region}
                            style={[
                                styles.leftItem,
                                selectedPersonalized === region && styles.selectedLeftItem,
                            ]}
                            onPress={() => setSelectedPersonalized(region)}
                        >
                            <Text
                                style={[
                                    styles.leftItemText,
                                    selectedPersonalized === region && styles.selectedLeftItemText,
                                ]}
                            >
                                {region}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ScrollView style={styles.rightColumn}>
                    {personalizedMap[selectedPersonalized].map((subPersonalized) => (
                        <TouchableOpacity
                            key={subPersonalized}
                            style={styles.rightItem}
                            onPress={() => toggleSubPersonalized(subPersonalized)}
                        >
                            <Text
                                style={[
                                    styles.rightItemText,
                                    selectedSubPersonalized.includes(subPersonalized) && { color: COLORS.THEMECOLOR, fontWeight: 'bold' },
                                ]}
                            >
                                {subPersonalized}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {selectedSubPersonalized.length > 0 && (
                <View style={styles.selectedSubPersonalizedContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.selectedSubPersonalizedContent}
                    >
                        {selectedSubPersonalized.map((subPersonalized) => (
                            <View key={subPersonalized} style={styles.selectedSubPersonalizedCard}>
                                <Text style={styles.selectedSubPersonalizedText}>{subPersonalized}</Text>
                                <TouchableOpacity onPress={() => removeSubPersonalized(subPersonalized)}>
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
    regionWrapper: {
        flexDirection: 'row',
        flex: 1,
    },
    leftColumn: {
        width: wp(40),
        borderRightWidth: 1,
        borderRightColor: '#eee',
        paddingRight: wp(2),
    },
    rightColumn: {
        width: wp(60),
        paddingLeft: wp(2),
    },
    leftItem: {
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(3),
    },
    leftItemText: {
        fontSize: wp(4),
        color: '#333',
    },
    selectedLeftItem: {
        backgroundColor: COLORS.THEMECOLOR + '20',
    },
    selectedLeftItemText: {
        fontWeight: 'bold',
        color: COLORS.THEMECOLOR,
    },
    rightItem: {
        paddingVertical: hp(1.6),
        paddingHorizontal: wp(3),
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    rightItemText: {
        fontSize: wp(3.8),
        color: '#555',
    },
    selectedSubPersonalizedContainer: {
        borderTopWidth: 1,
        borderColor: '#ddd',
        paddingVertical: hp(1),
        paddingHorizontal: wp(2),
    },
    selectedSubPersonalizedContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    selectedSubPersonalizedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: wp(2),
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        marginRight: wp(2),
    },
    selectedSubPersonalizedText: {
        color: '#333',
        fontSize: wp(3.5),
        marginRight: wp(1.5),
    },
});
