import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import COLORS from '../../constants/colors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const dummyFavoriteCompanies = [
    {
        id: 1,
        company: '이길동사업',
        industry: 'IT 개발',
        location: '서울시 강남구',
        jobCount: 5,
    },
    {
        id: 2,
        company: '홍길동상사',
        industry: '식음료·외식',
        location: '부산광역시 해운대구',
        jobCount: 3,
    },
    {
        id: 3,
        company: '청춘컴퍼니',
        industry: '마케팅·광고',
        location: '대구광역시 중구',
        jobCount: 7,
    },
];

export default function FavoriteCompaniesScreen() {
    const navigation = useNavigation();
    const [favoriteCompanies, setFavoriteCompanies] = useState([]);

    useEffect(() => {
        // 나중에 API 호출로 교체 예정
        setFavoriteCompanies(dummyFavoriteCompanies);
    }, []);

    const handleCompanyPress = (company) => {
        navigation.navigate('CompanyDetailScreen', { companyId: company.id });
    };

    const renderCompanyCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleCompanyPress(item)}
            activeOpacity={0.8}
        >

            <Text style={styles.companyName} numberOfLines={1}>
                {item.company}
            </Text>


            <View style={styles.infoRow}>
                <Text style={styles.infoText}>업종: {item.industry}</Text>
                <Text style={styles.infoText}>채용공고 수: {item.jobCount}</Text>
                <Text style={styles.infoText}>위치: {item.location}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {favoriteCompanies.length === 0 ? (
                <Text style={styles.emptyText}>관심 등록한 기업이 없습니다.</Text>
            ) : (
                <FlatList
                    data={favoriteCompanies}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCompanyCard}
                    contentContainerStyle={{ paddingBottom: hp('5%') }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20,
        paddingHorizontal: 20,
    },
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
        shadowRadius: 4,
        elevation: 3,
    },
    companyName: {
        fontSize: wp('4%'),
        fontWeight: '500',
        color: '#000',
        flexShrink: 1,
        marginBottom: hp('1.2%'),
    },
    bookmarkButton: {
        padding: wp('1%'),
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    infoText: {
        fontSize: wp('3.8%'),
        color: '#555',
        marginRight: wp('4%'),
        marginBottom: hp('0.6%'),
    },
    emptyText: {
        textAlign: 'center',
        marginTop: hp('15%'),
        fontSize: wp('4.5%'),
        color: 'gray',
    },
});
