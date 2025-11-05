import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';

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
