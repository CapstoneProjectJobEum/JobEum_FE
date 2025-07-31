import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import COLORS from '../../../constants/colors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Ionicons from '@expo/vector-icons/Ionicons';

const jobTypeMap = {
    식음료외식: ['카페 매니저', '레스토랑 매니저', '바리스타', '홀서버', '주방 보조', '조리사', '영양사', '식품 개발', '식품 연구원'],
    IT개발: ['프론트엔드 개발자', '백엔드 개발자', '앱 개발자', '데이터 엔지니어', 'AI 엔지니어', '게임 클라이언트', '웹 퍼블리셔', 'IT 헬프데스크'],
    디자인: ['그래픽 디자이너', 'UX/UI 디자이너', '제품 디자이너', '모션 그래픽 디자이너', '일러스트레이터', '편집 디자이너', '3D 모델러'],
    마케팅광고: ['마케팅 매니저', '브랜드 매니저', '콘텐츠 마케터', '퍼포먼스 마케터', '광고 AE', 'SNS 마케터', 'PR/홍보 담당자'],
    고객서비스: ['고객센터 상담원', 'CS 매니저', 'CRM 담당자', '쇼핑몰 운영', '매장 관리자', '리셉션'],
    경영사무: ['경영지원', '사무보조', '총무', '인사담당자', '회계담당자', '법무', '비서'],
    물류운송: ['물류관리', '택배 포장', '배송기사', '지게차 기사', '입출고 담당자'],
    교육: ['학원강사', '방문교사', '보육교사', '유치원 교사', '교육 콘텐츠 개발자'],
    생산제조: ['생산직 사원', '기계 조작원', '품질 검사원', '설비 유지보수', '포장 작업자'],
    건설엔지니어링: ['건축 설계', '토목 기사', '전기기사', '설비 엔지니어', '현장소장', '안전관리자']
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