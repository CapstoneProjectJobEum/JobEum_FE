import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


export default function AiJobCard({ job, onPress }) {

    const formatCareerRange = (careerArray) => {
        if (!careerArray || careerArray.length === 0) return '정보 없음';

        // 숫자 경력만 분리 (예: "1년", "2년")
        const numberCareers = careerArray
            .filter(item => /^\d+년$/.test(item))
            .map(item => parseInt(item.replace('년', ''), 10));

        const specialCareers = careerArray.filter(item => !/^\d+년$/.test(item));

        let range = '';
        if (numberCareers.length > 0) {
            numberCareers.sort((a, b) => a - b);
            range = `${numberCareers[0]}~${numberCareers[numberCareers.length - 1]}년`;
        }

        // 숫자 경력 + 특수 경력 합치기
        return [...(range ? [range] : []), ...specialCareers].join(', ');
    };

    const formatEducation = (educationList) => {
        if (!educationList || educationList.length === 0) return '-';
        const displayed = educationList.slice(0, 2).join(', ');
        return educationList.length > 2 ? displayed + '...' : displayed;
    };



    return (
        <TouchableOpacity onPress={() => onPress(job)} style={styles.card}>
            <View style={styles.cardContent}>
                {/* 기업명 */}
                <Text style={styles.company} numberOfLines={1} ellipsizeMode="tail">
                    {job.company}
                </Text>

                {/* 위치 */}
                <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
                    {job.location}
                </Text>

                {/* 제목 */}
                <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                    {job.title}
                </Text>

                {/* 마감 */}
                <Text style={styles.infoText}>
                    마감: {job.deadline}
                </Text>

                {/* 경력 */}
                {job.filters?.career?.length > 0 && (
                    <Text style={styles.infoText}>
                        경력: {formatCareerRange(job.filters.career)}
                    </Text>
                )}

                {/* 학력 */}
                {job.filters?.education?.length > 0 && (
                    <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
                        학력: {formatEducation(job.filters.education)}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: wp('50%'),
        height: Platform.OS === 'android' ? wp('55%') : wp('45%'),
        backgroundColor: '#fff',
        borderRadius: wp('3%'),
        borderWidth: 1,
        borderColor: '#ddd',
        padding: wp('3%'),
        marginRight: wp('4%'),
        marginBottom: hp('1.5%'),
        shadowColor: '#aaa',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        justifyContent: 'flex-start',
    },
    cardContent: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    company: {
        fontSize: wp('4%'),
        fontWeight: '600',
        color: '#333',
        marginBottom: hp('0.3%')
    },
    location: {
        fontSize: wp('3.5%'),
        color: '#666',
        marginBottom: hp('0.5%')
    },
    title: {
        fontSize: wp('4.5%'),
        fontWeight: '700',
        color: '#222',
        marginBottom: hp('1%')
    },
    infoText: {
        fontSize: wp('3.5%'),
        color: '#666',
        marginBottom: hp('0.5%')
    },
});
