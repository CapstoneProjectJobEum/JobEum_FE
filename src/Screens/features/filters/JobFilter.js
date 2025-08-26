import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';

const jobTypeMap = {
    식음료외식: [
        '바리스타', '홀서버', '주방 보조', '조리 보조',
        '매장 관리', '푸드 코디네이터'
    ],
    사무행정: [
        '사무보조', '문서 관리', '데이터 입력', '경영지원',
        '인사담당자', '회계보조', '총무', '비서'
    ],
    고객상담서비스: [
        '콜센터 상담원', '고객센터 상담원', 'CS 매니저', '리셉션',
        '안내데스크', '민원 응대'
    ],
    IT개발: [
        '프론트엔드 개발자', '백엔드 개발자', '앱 개발자',
        '웹 퍼블리셔', 'IT 헬프데스크', 'QA 테스터',
        '데이터 입력 · 가공', '디지털 마케터'
    ],
    디자인출판: [
        '그래픽 디자이너', '편집 디자이너', '일러스트레이터',
        '영상 편집자', '웹디자이너', '콘텐츠 크리에이터'
    ],
    생산제조: [
        '생산직 사원', '포장 작업자', '품질 검사원',
        '단순 조립원', '기계 조작 보조'
    ],
    물류유통: [
        '물류관리', '택배 포장', '입출고 담당자',
        '상품 분류', '배송 보조'
    ],
    교육사회복지: [
        '특수교사 보조', '방과후 교사', '직업훈련 강사',
        '사회복지사 보조', '교육 콘텐츠 개발자', '도서관 사서 보조'
    ],
    공공기관일자리: [
        '행정 보조', '자료 정리', '안내 요원',
        '시설 관리 보조', '우편물 분류'
    ],
    기타서비스: [
        '환경미화', '경비', '세탁 · 청소',
        '주차 관리', '시설 관리'
    ]
};


export default function JobFilter({ selectedJob, setSelectedJob, selectedSubJob, setSelectedSubJob }) {

    const toggleArea = (area) => {
        if (selectedSubJob.includes(area)) {
            setSelectedSubJob(selectedSubJob.filter((item) => item !== area));
        } else {
            setSelectedSubJob([...selectedSubJob, area]);
        }
    };

    const removeArea = (area) => {
        setSelectedSubJob(selectedSubJob.filter((item) => item !== area));
    };


    return (
        <View style={styles.container}>
            <View style={styles.regionWrapper}>
                <ScrollView style={styles.leftColumn}>
                    {Object.keys(jobTypeMap).map((region) => (
                        <TouchableOpacity
                            key={region}
                            style={[
                                styles.leftItem,
                                selectedJob === region && styles.selectedLeftItem,
                            ]}
                            onPress={() => setSelectedJob(region)}
                        >
                            <Text
                                style={[
                                    styles.leftItemText,
                                    selectedJob === region && styles.selectedLeftItemText,
                                ]}
                            >
                                {region}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ScrollView style={styles.rightColumn}>
                    {jobTypeMap[selectedJob].map((area) => (
                        <TouchableOpacity
                            key={area}
                            style={styles.rightItem}
                            onPress={() => toggleArea(area)}
                        >
                            <Text
                                style={[
                                    styles.rightItemText,
                                    selectedSubJob.includes(area) && { color: COLORS.THEMECOLOR, fontWeight: 'bold' },
                                ]}
                            >
                                {area}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {selectedSubJob.length > 0 && (
                <View style={styles.selectedAreaContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.selectedAreaContent}
                    >
                        {selectedSubJob.map((area) => (
                            <View key={area} style={styles.selectedAreaCard}>
                                <Text style={styles.selectedAreaText}>{area}</Text>
                                <TouchableOpacity onPress={() => removeArea(area)}>
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
    selectedAreaContainer: {
        borderTopWidth: 1,
        borderColor: '#ddd',
        paddingVertical: hp(1),
        paddingHorizontal: wp(2),
    },
    selectedAreaContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    selectedAreaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: wp(2),
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        marginRight: wp(2),
    },
    selectedAreaText: {
        color: '#333',
        fontSize: wp(3.5),
        marginRight: wp(1.5),
    },
});