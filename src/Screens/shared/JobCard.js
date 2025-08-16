import React, { useState, useCallback, useEffect } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';


const statusColorMap = {
    '서류 심사중': '#4A90E2',   // 부드러운 블루 (기존 유지)
    '1차 합격': '#7BBF9E', // 부드럽고 차분한 세이지 그린 계열
    '면접 예정': '#F4A261', // 따뜻하고 부드러운 오렌지-살구 톤
    '최종 합격': '#3CAEA3',    // 진한 청록색, 안정감 있는 색상
    '불합격': '#B5534C',       // 톤 다운된 브릭 레드
};


export default function JobCard({ job, onPress, type = 'default', isFavorite, onToggleFavorite, userType }) {
    // 기업회원이면 항상 recent 타입처럼 처리
    const effectiveType =
        userType === '기업회원' || type === 'favorite'
            ? 'recent'
            : type;


    const [applicationStatus, setApplicationStatus] = useState(null);
    useEffect(() => {
        const fetchApplicationStatus = async () => {
            try {
                const token = await AsyncStorage.getItem("accessToken");
                const res = await axios.get(
                    `${BASE_URL}/api/applications/status/${job.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log(res.data);
                setApplicationStatus(res.data); // { status, is_viewed }
            } catch (err) {
                console.error("지원 현황 불러오기 실패", err);
            }
        };

        if (type === "applied") {
            fetchApplicationStatus();
        }
    }, [job.id]);

    const getBadgeText = () => {
        if (!applicationStatus) return null;

        if (applicationStatus.is_viewed === 0) {
            return "지원됨"; // 열람 전에는 무조건 "지원됨"
        }
        return applicationStatus.status || "지원됨";
    };


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



    return (
        <TouchableOpacity onPress={() => onPress(job)} style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.header}>
                    <View style={styles.companyLocationRow}>
                        <Text style={styles.company} numberOfLines={1}>
                            {job.company}
                        </Text>



                        {effectiveType === "applied" && applicationStatus && (
                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor:
                                            getBadgeText() === "지원됨"
                                                ? "#6c757d"
                                                : statusColorMap[applicationStatus.status],
                                    },
                                ]}
                            >
                                <Text style={styles.statusBadgeText}>{getBadgeText()}</Text>
                            </View>
                        )}

                        {effectiveType === 'default' && (
                            <TouchableOpacity onPress={() => onToggleFavorite(job.id)} style={styles.starButton}>
                                <Icon
                                    name={isFavorite ? 'bookmark' : 'bookmark-o'}
                                    size={20}
                                    color={isFavorite ? '#FFD700' : '#999'}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {effectiveType !== 'recent' && (
                        <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
                            {job.location}
                        </Text>
                    )}

                    {effectiveType === 'recent' && (
                        <View style={styles.companyLocationColumn}>
                            <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
                                {job.location}
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                    {job.title}
                </Text>

                <View style={styles.footer}>
                    {effectiveType === 'applied' ? (
                        <>
                            <Text style={styles.infoText}>
                                지원일: {job.appliedAt ? job.appliedAt.slice(0, 10) : '-'}
                            </Text>
                            <Text style={styles.infoText}>마감일: {job.deadline}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.infoText}>마감: {job.deadline}</Text>
                            {/* 경력 */}
                            {job.filters?.career?.length > 0 && (
                                <Text style={styles.infoText}>
                                    경력: {formatCareerRange(job.filters.career)}
                                </Text>
                            )}

                            {/* 학력 */}
                            {job.filters?.education?.length > 0 && (
                                <Text style={styles.infoText}>
                                    학력: {job.filters.education.join(', ')}
                                </Text>
                            )}
                        </>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: wp('3%'),
        borderWidth: 1,
        borderColor: '#ddd',
        padding: wp('4%'),
        marginVertical: hp('0.8%'),
        shadowColor: '#aaa',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardContent: {
        flex: 1,
    },
    header: {
        marginBottom: hp('1%'),
    },
    companyLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginRight: wp('2%'),
    },
    companyLocationColumn: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginTop: hp('0.5%'),
    },
    company: {
        fontSize: wp('4%'),
        fontWeight: '600',
        color: '#333',
        marginRight: wp('2%'),
    },
    location: {
        fontSize: wp('3.5%'),
        color: '#777',
        maxWidth: wp('85%'),
    },
    title: {
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
        color: '#111',
        marginBottom: hp('1%'),
    },
    footer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    infoText: {
        fontSize: wp('3.5%'),
        color: '#666',
        marginRight: wp('3%'),
        marginBottom: hp('0.5%'),
    },
    starButton: {
        padding: wp('1%'),
    },
    statusBadge: {
        paddingHorizontal: wp('2.5%'),
        paddingVertical: hp('0.3%'),
        borderRadius: wp('2%'),
        marginBottom: hp('0.5%'),
    },
    statusBadgeText: {
        color: '#fff',
        fontSize: wp('3.2%'),
        fontWeight: '600',
    },
});
