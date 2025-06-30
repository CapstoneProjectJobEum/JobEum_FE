import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function ApplicationDetailsScreen({ route }) {
    const { resume } = route.params;
    console.log('받은 resume 데이터:', resume);

    const statusOptions = ['서류 심사중', '1차 합격', '면접 예정', '최종 합격', '불합격'];
    const [selectedStatus, setSelectedStatus] = useState(resume.status || '서류 심사중');

    const handleStatusSelect = (status) => {
        setSelectedStatus(status);
        // TODO: 서버로 상태 저장 API 호출 가능
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>{resume.title || '제목 없음'}</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>인적사항</Text>
                    <Text style={styles.text}>{resume.personalInfo || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>희망직무</Text>
                    <Text style={styles.text}>{resume.desiredJob || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>학력</Text>
                    <Text style={styles.text}>{resume.education || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>경력</Text>
                    <Text style={styles.text}>{resume.career || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>자기소개서</Text>
                    <Text style={styles.text}>{resume.selfIntroduction || '내용 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>자격증</Text>
                    <Text style={styles.text}>{resume.certificates || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>인턴 / 대외활동</Text>
                    <Text style={styles.text}>{resume.internshipActivities || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>취업우대 / 병역</Text>
                    <Text style={styles.text}>{resume.preferencesMilitary || '정보 없음'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>희망 근무 조건</Text>
                    <Text style={styles.text}>{resume.workConditions || '정보 없음'}</Text>
                </View>
            </ScrollView>

            {/* 상태 선택 버튼 영역 */}
            <View style={styles.buttonContainer}>
                {statusOptions.map((status) => (
                    <TouchableOpacity
                        key={status}
                        onPress={() => handleStatusSelect(status)}
                        style={[
                            styles.button,
                            selectedStatus === status && styles.selectedStatusButton
                        ]}
                    >
                        <Text
                            style={[
                                styles.buttonText,
                                selectedStatus === status && styles.selectedStatusText
                            ]}
                        >
                            {status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: wp('6%'),
        paddingTop: hp('3%'),
        paddingBottom: hp('15%'),
    },
    title: {
        fontSize: wp('6.5%'),
        fontWeight: 'bold',
        marginBottom: hp('2%'),
        color: '#111',
    },
    section: {
        marginBottom: hp('2.5%'),
    },
    sectionTitle: {
        fontSize: wp('5%'),
        fontWeight: '600',
        marginBottom: hp('0.8%'),
        color: '#222',
    },
    text: {
        fontSize: wp('4.2%'),
        color: '#333',
        lineHeight: hp('3%'),
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: wp('2%'),
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.5%'),
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
        width: wp('100%'),
    },
    button: {
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingVertical: hp('1.2%'),
        paddingHorizontal: wp('4%'),
        marginBottom: hp('1%'),
        marginHorizontal: wp('1%'),
    },
    selectedStatusButton: {
        backgroundColor: '#007bff',
    },
    buttonText: {
        fontSize: wp('4%'),
        color: '#333',
    },
    selectedStatusText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
