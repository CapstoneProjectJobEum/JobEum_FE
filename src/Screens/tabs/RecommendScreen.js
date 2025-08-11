import React, { useState } from 'react';
import { FlatList, Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import COLORS from "../../constants/colors";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FilterTabSection from './FilterTabSection';

import Icon from 'react-native-vector-icons/FontAwesome';
const jobData = [
    {
        id: '1',
        title: '프론트엔드 개발자',
        company: '잡이음 주식회사',
        location: '서울 강남구',
        deadline: '2025-06-30',
        career: '신입/경력',
        education: '학력무관',
    },
    {
        id: '2',
        title: '백엔드 개발자',
        company: '이음소프트',
        location: '부산 해운대구',
        deadline: '2025-07-10',
        career: '경력 2년 이상',
        education: '학력무관',
    },
    {
        id: '3',
        title: 'AI 연구원',
        company: 'AIHub Inc.',
        location: '대전 유성구',
        deadline: '2025-06-20',
        career: '박사 우대',
        education: '학력무관',
    },
    {
        id: '4',
        title: 'UX 디자이너',
        company: '디자인팩토리',
        location: '서울 마포구',
        deadline: '2025-07-01',
        career: '신입 가능',
        education: '학력무관',
    },

];
export default function RecommendScreen() {
    const navigation = useNavigation();
    const [favorites, setFavorites] = useState({});

    const handlePress = (job) => {
        navigation.navigate('JobDetailScreen', { job });
    };

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
                    <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.starButton}>
                        <Icon
                            name={favorites[item.id] ? 'bookmark' : 'bookmark-o'}
                            size={20}
                            color={favorites[item.id] ? '#FFD700' : '#999'}
                        />
                    </TouchableOpacity>
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
        <>
            <FilterTabSection
                filterStorageKey='@filterState_Recommend'
            />

            <View style={styles.container}>
                <FlatList
                    data={jobData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
        backgroundColor: '#FFF',
    },
    card: {
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
    starButton: {
        padding: wp('1%'),
    },
});
