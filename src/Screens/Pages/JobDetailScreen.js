import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const JobDetailScreen = ({ route }) => {
    const { job } = route.params;
    console.log('받은 job 데이터:', job);
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>{job.title || '제목 없음'}</Text>
                <Text style={styles.company}>{job.company || '회사명 없음'}</Text>
                <Text style={styles.location}>{job.location || '위치 정보 없음'}</Text>

                <View style={styles.infoRow}>
                    {job.deadline && (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>마감: {job.deadline}</Text>
                        </View>
                    )}
                    {job.career && (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>경력: {job.career}</Text>
                        </View>
                    )}
                    {job.education && (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>학력: {job.education}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>채용 조건 요약</Text>
                    <Text style={styles.text}>
                        {job.summary?.trim() || '요약 정보가 없습니다.'}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>채용 상세 내용</Text>
                    <Text style={styles.text}>
                        {job.detail?.trim() || '상세 내용이 없습니다.'}
                    </Text>
                </View>

                {job.condition && job.condition.trim() !== '' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>조건</Text>
                        <Text style={styles.text}>{job.condition}</Text>
                    </View>
                )}

                {job.jobConditions && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>장애인 채용 조건</Text>

                        {job.jobConditions.disabilityGrade && (
                            <Text style={styles.text}>장애 정도: {job.jobConditions.disabilityGrade}</Text>
                        )}

                        {job.jobConditions.disabilityTypes?.length > 0 && (
                            <Text style={styles.text}>
                                장애 유형: {job.jobConditions.disabilityTypes.join(', ')}
                            </Text>
                        )}

                        {job.jobConditions.assistiveDevices?.length > 0 && (
                            <Text style={styles.text}>
                                보조 기구: {job.jobConditions.assistiveDevices.join(', ')}
                            </Text>
                        )}

                        {job.jobConditions.jobInterest?.length > 0 && (
                            <Text style={styles.text}>
                                직무 관심: {job.jobConditions.jobInterest.join(', ')}
                            </Text>
                        )}

                        {job.jobConditions.preferredWorkType?.length > 0 && (
                            <Text style={styles.text}>
                                선호 근무 형태: {job.jobConditions.preferredWorkType.join(', ')}
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>스크랩</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.applyButton]}>
                    <Text style={styles.buttonText}>지원하기</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default JobDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: wp('6%'),
        paddingTop: hp('3%'),
        paddingBottom: hp('15%'), // 버튼 높이 + 여백
    },
    title: {
        fontSize: wp('6.5%'),
        fontWeight: 'bold',
        marginBottom: hp('0.8%'),
        color: '#111',
    },
    company: {
        fontSize: wp('5%'),
        marginBottom: hp('0.3%'),
        color: '#555',
    },
    location: {
        fontSize: wp('4.5%'),
        marginBottom: hp('1.5%'),
        color: '#666',
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: hp('3%'),
        gap: wp('2%'),
    },
    tag: {
        backgroundColor: '#e0e0e0',
        borderRadius: wp('3%'),
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('0.8%'),
        marginRight: wp('2%'),
        marginBottom: hp('0.8%'),
    },
    tagText: {
        fontSize: wp('3.7%'),
        color: '#444',
    },
    section: {
        marginBottom: hp('3%'),
    },
    sectionTitle: {
        fontSize: wp('5%'),
        fontWeight: '600',
        marginBottom: hp('1%'),
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
        backgroundColor: '#999',
        marginHorizontal: wp('4%'),
        paddingVertical: hp('1.5%'),
        borderRadius: 10,
        alignItems: 'center',
    },
    applyButton: {
        backgroundColor: '#007bff',
    },
    buttonText: {
        color: '#fff',
        fontSize: wp('4.3%'),
        fontWeight: '600',
    },
});
