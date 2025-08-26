import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';

const regionMap = {
    전국: ['전체'],

    // 수도권
    서울: ['전체', '강남구', '서초구', '송파구', '마포구', '종로구', '영등포구', '강서구', '구로구', '관악구'],
    경기: ['전체', '수원시', '성남시', '용인시', '고양시', '부천시', '안양시', '안산시', '남양주시', '화성시', '평택시', '의정부시'],
    인천: ['전체', '남동구', '연수구', '부평구', '미추홀구', '서구'],

    // 강원·충청
    강원: ['전체', '춘천시', '원주시', '강릉시'],
    충북: ['전체', '청주시', '충주시'],
    충남: ['전체', '천안시', '아산시', '서산시'],

    // 대전·세종
    대전: ['전체', '서구', '유성구', '중구', '대덕구'],
    세종: ['전체'],

    // 전라
    전북: ['전체', '전주시', '익산시', '군산시'],
    전남: ['전체', '여수시', '순천시', '목포시', '광양시'],
    광주: ['전체', '서구', '북구', '남구', '동구'],

    // 경상북도
    경북: ['전체', '포항시', '구미시', '경주시', '안동시'],
    대구: ['전체', '수성구', '달서구', '북구', '동구'],

    // 경상남도
    경남: ['전체', '창원시', '김해시', '진주시', '양산시'],
    부산: ['전체', '해운대구', '수영구', '부산진구', '사하구', '동래구'],
    울산: ['전체', '남구', '중구', '북구'],

    // 제주
    제주: ['전체', '제주시', '서귀포시'],
};

export default function RegionFilter({ selectedRegion, setSelectedRegion, selectedSubRegion, setSelectedSubRegion }) {
    const toggleSubRegion = (subRegion) => {
        const isAll = subRegion === '전체';
        const subRegionLabel = isAll ? selectedRegion : subRegion;

        if (selectedSubRegion.includes(subRegionLabel)) {
            setSelectedSubRegion(selectedSubRegion.filter(item => item !== subRegionLabel));
        } else {
            setSelectedSubRegion([...selectedSubRegion, subRegionLabel]);
        }
    };

    const removeSubRegion = (subRegion) => {
        setSelectedSubRegion(selectedSubRegion.filter(item => item !== subRegion));
    };

    return (
        <View style={styles.container}>
            <View style={styles.regionWrapper}>
                <ScrollView style={styles.leftColumn}>
                    {Object.keys(regionMap).map(region => (
                        <TouchableOpacity
                            key={region}
                            style={[styles.leftItem, selectedRegion === region && styles.selectedLeftItem]}
                            onPress={() => setSelectedRegion(region)}
                        >
                            <Text style={[styles.leftItemText, selectedRegion === region && styles.selectedLeftItemText]}>
                                {region}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ScrollView style={styles.rightColumn}>
                    {regionMap[selectedRegion]?.map(subRegion => (
                        <TouchableOpacity key={subRegion} style={styles.rightItem} onPress={() => toggleSubRegion(subRegion)}>
                            <Text
                                style={[
                                    styles.rightItemText,
                                    selectedSubRegion.includes(subRegion) && { color: COLORS.THEMECOLOR, fontWeight: 'bold' },
                                ]}
                            >
                                {subRegion}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {selectedSubRegion.length > 0 && (
                <View style={styles.selectedSubRegionContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedSubRegionContent}>
                        {selectedSubRegion.map(subRegion => (
                            <View key={subRegion} style={styles.selectedSubRegionCard}>
                                <Text style={styles.selectedSubRegionText}>{subRegion}</Text>
                                <TouchableOpacity onPress={() => removeSubRegion(subRegion)}>
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
    selectedSubRegionContainer: {
        borderTopWidth: 1,
        borderColor: '#ddd',
        paddingVertical: hp(1),
        paddingHorizontal: wp(2),
    },
    selectedSubRegionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    selectedSubRegionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: wp(2),
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        marginRight: wp(2),
    },
    selectedSubRegionText: {
        color: '#333',
        fontSize: wp(3.5),
        marginRight: wp(1.5),
    },
});
