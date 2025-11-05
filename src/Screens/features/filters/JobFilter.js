import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';

const jobTypeMap = {
    SW앱개발: [
        '프론트엔드 개발자', '백엔드 개발자', '소프트웨어 엔지니어',
        '웹 접근성 개발자', '자바 개발자', '모바일 앱 개발자'
    ],
    웹디자인: [
        '웹디자이너', 'UI‧UX 디자이너', '퍼블리셔', '상세페이지 디자이너',
        '그래픽 디자이너', '영상 편집 디자이너'
    ],
    경영사무: [
        '사무 행정원', '회계 보조원', '경리 사무원', '인사‧총무 지원',
        '문서 관리원', '법률 사무 보조'
    ],
    데이터QA: [
        '데이터 라벨러', '데이터 입력원', '데이터 매니저(AI 학습)',
        '웹 접근성 평가사', '게임 QA 테스터', '품질 검수원'
    ],
    고객상담: [
        '인바운드 콜센터 상담사', '온라인 채팅 상담원', '고객 지원(CS) 요원',
        '텔레마케터', '전화 모니터링 요원'
    ],
    마케팅홍보: [
        '온라인 홍보 마케터', 'SNS 콘텐츠 관리자', '마케팅 기획 보조',
        '광고 배너 관리원', '바이럴 마케팅 보조'
    ],
    헬스복지: [
        '안마사‧헬스키퍼', '사회복지 행정 보조', '병원 행정 사무원',
        '요양 보호 보조', '의료 서비스 지원가'
    ],
    제조생산: [
        '제품 조립원', '생산품 포장‧검수원', '반도체 생산 보조',
        '구두 제작‧수선', '친환경 제품 검수원'
    ],
    예술창작: [
        '시각 예술 작가', '웹소설‧만화 스토리 작가', '디지털 콘텐츠 제작자',
        '공예(도예, 목공) 작가', '웹툰 어시스턴트'
    ],
    교육지원: [
        '특수교육 실무사', '사서 보조원', '직업재활 훈련 보조',
        '장애인 평생교육 보조교사', '장애인 채용 컨설턴트 보조'
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