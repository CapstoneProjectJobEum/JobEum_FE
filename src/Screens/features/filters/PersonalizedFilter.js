import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';

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
        '식음료외식', '사무행정', '고객상담서비스', 'IT개발', '디자인출판',
        '생산제조', '물류유통', '교육사회복지', '공공기관일자리', '기타서비스'
    ],
    근무가능형태: [
        '재택근무 가능', '사무실 출근 가능', '파트타임 선호',
        '풀타임 선호', '시간제 가능', '유연근무 가능',
        '장애인 전용 채용', '일반 채용 참여 희망'
    ],
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
