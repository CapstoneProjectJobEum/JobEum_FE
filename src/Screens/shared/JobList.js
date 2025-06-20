import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const JobList = ({ apiUrl, fallbackData = [], type = 'default', favoriteIds = [] }) => {
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);
    const [favorites, setFavorites] = useState({});

    const statusColorMap = {
        '서류 심사중': '#007BFF',
        '1차 합격': '#28A745',
        '최종 합격': '#20C997',
        '불합격': '#DC3545',
        '면접 예정': '#FFC107',
    };

    useEffect(() => {
        const fetchJobs = async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 2000);

            let jobData = [];

            try {
                const res = await axios.get(apiUrl, { signal: controller.signal });
                clearTimeout(timeout);
                jobData = res.data;
            } catch (err) {
                console.warn('데이터 불러오기 실패:', err.message);
                jobData = fallbackData;
            }

            // 즐겨찾기 필터링 (props.favoriteIds 기준)
            // 최근 본 공고는 최대 10개로 자름
            const filtered = type === 'recent'
                ? jobData.slice(0, 10)
                : type === 'favorite'
                    ? jobData.filter((job) => favoriteIds.includes(job.id))
                    : jobData;

            setJobs(filtered);
        };

        fetchJobs();
    }, [apiUrl, favoriteIds, type]);


    const toggleFavorite = (id) => {
        setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)} style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.header}>
                    <View style={styles.companyLocation}>
                        <Text style={styles.company}>{item.company}</Text>
                        <Text style={styles.location}>{item.location}</Text>
                    </View>

                    {/* 우측 즐겨찾기 → 상태 텍스트 대체 */}
                    {type === 'applied' ? (
                        <View style={[styles.statusBadge, { backgroundColor: statusColorMap[item.status] || '#6c757d' }]}>
                            <Text style={styles.statusBadgeText}>{item.status}</Text>
                        </View>
                    ) : type !== 'recent' && ( // 최근 공고에는 별 없음
                        <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.starButton}>
                            <Icon
                                name={favorites[item.id] ? 'star' : 'star-o'}
                                size={20}
                                color={favorites[item.id] ? '#FFD700' : '#999'}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.title}>{item.title}</Text>

                <View style={styles.footer}>
                    {/* 마감일 → 지원일로 대체 */}
                    {type === 'applied' ? (
                        <Text style={styles.infoText}>지원일: {item.appliedDate}</Text>
                    ) : (
                        <Text style={styles.infoText}>마감: {item.deadline}</Text>
                    )}
                    {/* career, education 제거 */}
                </View>
            </View>
        </TouchableOpacity>
    );



    return (
        <FlatList
            data={jobs}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.container}
        />
    );
};

export default JobList;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
        backgroundColor: '#F8F9FA',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        borderWidth: 1,
        borderColor: '#ddd',
        padding: wp('4%'),
        marginBottom: hp('1.2%'),
        shadowColor: '#aaa',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    cardContent: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('0.5%'),
    },
    companyLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('2%'),
    },
    company: {
        fontSize: wp('4%'),
        color: '#333',
    },
    location: {
        fontSize: wp('3.5%'),
        color: '#666',
    },
    title: {
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
        marginBottom: hp('1%'),
    },
    footer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp('2%'),
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
        alignSelf: 'flex-start',
    },

    statusBadgeText: {
        color: '#fff',
        fontSize: wp('3.2%'),
        fontWeight: '600',
    },

});
