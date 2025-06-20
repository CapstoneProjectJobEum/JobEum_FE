import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import COLORS from '../../../constants/colors';

const ResumeDetailScreen = ({ route }) => {
    const { resume } = route.params;
    console.log('받은 resume 데이터:', resume);

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

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]}>
                    <Text style={styles.buttonText}>삭제</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ResumeDetailScreen;

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
        justifyContent: 'space-between',
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('1%'),
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 15,
        width: wp('100%'),
    },
    button: {
        flex: 1,
        backgroundColor: COLORS.THEMECOLOR,
        marginHorizontal: wp('2%'),
        paddingVertical: hp('1.5%'),
        borderRadius: 10,
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: COLORS.GRAY_LIGHT,
    },
    buttonText: {
        color: '#fff',
        fontSize: wp('4.3%'),
        fontWeight: '600',
    },
});
