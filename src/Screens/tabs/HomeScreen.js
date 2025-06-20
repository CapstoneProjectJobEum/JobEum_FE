import React, { useEffect, useState } from 'react';
import { ScrollView, View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';

const HomeScreen = () => {
    const navigation = useNavigation();

    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [generalJobs, setGeneralJobs] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = 1;
                const serverUrl = 'http://10.106.2.70:4000';

                const recRes = await axios.get(`${serverUrl}/api/jobs/recommend/${userId}`);
                const allRes = await axios.get(`${serverUrl}/api/jobs`);

                setRecommendedJobs(recRes.data);
                setGeneralJobs(allRes.data);
            } catch (err) {
                console.error('홈탭 채용공고 로딩 실패:', err.message);

                const dummyJobs = [
                    {
                        id: '1',
                        company: 'OpenAI',
                        location: '서울',
                        title: 'React Native 개발자',
                        career: '경력 3년 이상',
                        education: '학사 이상',
                        deadline: '2025-07-01',
                    },
                    {
                        id: '2',
                        company: '카카오엔터프라이즈',
                        location: '판교',
                        title: 'AI 백엔드 엔지니어',
                        career: '신입 가능',
                        education: '무관',
                        deadline: '2025-07-05',
                    },
                ];
                setRecommendedJobs(dummyJobs);
                setGeneralJobs(dummyJobs);
            }
        };

        fetchData();
    }, []);



    const handlePress = (job) => {
        navigation.navigate('JobDetailScreen', { job });
    };

    const renderAiJobCard = ({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)} style={styles.aiCard}>
            <View style={styles.aiCardContent}>
                <Text style={styles.company}>{item.company}</Text>
                <Text style={styles.location}>{item.location}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.infoText}>{item.career}</Text>
                <Text style={styles.infoText}>{item.education}</Text>
                <Text style={styles.deadline}>마감: {item.deadline}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderGeneralJobCard = ({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)} style={styles.generalCard}>
            <View style={styles.cardContent}>
                <View style={styles.header}>
                    <View style={styles.companyLocation}>
                        <Text style={styles.company}>{item.company}</Text>
                        <Text style={styles.location}>{item.location}</Text>
                    </View>
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.footer}>
                    <Text style={styles.infoText}>마감: {item.deadline}</Text>
                    <Text style={styles.infoText}>{item.career}</Text>
                    <Text style={styles.infoText}>{item.education}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.sectionTitle}>AI 추천 채용 공고</Text>
            <FlatList
                data={recommendedJobs}
                renderItem={renderAiJobCard}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: hp('3%') }}
            />

            <Text style={styles.sectionTitle}>맞춤 채용 공고</Text>
            <FlatList
                data={generalJobs}
                renderItem={renderGeneralJobCard}
                keyExtractor={(item) => item.id}
                numColumns={1}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
            />
        </ScrollView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
        backgroundColor: '#F8F9FA',
    },
    sectionTitle: {
        fontSize: wp('5.5%'),
        fontWeight: 'bold',
        marginBottom: hp('1.5%'),
    },
    aiCard: {
        width: wp('50%'),
        height: wp('40'), // 정사각형
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        borderWidth: 1,
        borderColor: '#ddd',
        padding: wp('4%'),
        marginRight: wp('4%'),
        marginVertical: hp('0.8%'),
        shadowColor: '#aaa',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    generalCard: {
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        borderWidth: 1,
        borderColor: '#ddd',
        padding: wp('4%'),
        marginVertical: hp('0.8%'),
        shadowColor: '#aaa',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    cardContent: {
        flex: 1,
    },
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
});
