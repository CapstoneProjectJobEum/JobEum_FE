import React, { useState, useCallback } from 'react';
import { useFocusEffect, useRoute } from "@react-navigation/native";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import COLORS from '../../constants/colors';
import axios from 'axios';
import { BASE_URL } from '@env';

export default function CompanyDetailScreen() {
    const route = useRoute();
    const { companyId } = route.params || {};

    const [form, setForm] = useState({
        company: '',
        companyType: '',
        companyContact: '',
        introduction: '',
        location: '',
        industry: '',
        establishedAt: '',
        employees: '',
        homepage: '',
    });

    const [jobCount, setJobCount] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchCompanyInfo = async () => {
                try {
                    if (!companyId) return;

                    const resUser = await axios.get(`${BASE_URL}/api/account-info/${companyId}`);
                    const resProfile = await axios.get(`${BASE_URL}/api/company-profile/${companyId}`);
                    const resJobs = await axios.get(`${BASE_URL}/api/jobs?companyId=${companyId}`); // API가 필터 지원할 경우

                    setForm({
                        company: resUser.data.company || '',
                        companyType: resProfile.data.company_type || '',
                        industry: resProfile.data.industry || '',
                        employees: resProfile.data.employees || '',
                        establishedAt: resProfile.data.established_at || '',
                        location: resProfile.data.location || '',
                        companyContact: resProfile.data.company_contact || '',
                        homepage: resProfile.data.homepage || '',
                        introduction: resProfile.data.introduction || '',
                    });

                    setJobCount(resJobs.data.length);

                    // TODO: 북마크 상태 fetch 및 setIsBookmarked 호출 (API 연동 시)

                } catch (error) {
                    console.log('기업 정보 불러오기 오류:', error);
                }
            };

            fetchCompanyInfo();
        }, [companyId])
    );

    const formatPhoneNumber = (phone) => {
        if (!phone) return '-';

        const digits = phone.replace(/\D/g, '');

        if (digits.length === 10) {
            return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        } else if (digits.length === 11) {
            return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }
        return phone;
    };

    const onToggleBookmark = () => {
        setIsBookmarked(prev => !prev);
        // TODO: 서버에 북마크 상태 저장 API 호출
    };

    return (
        <ScrollView style={{ backgroundColor: '#fff' }} contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.companyName}>{form.company || '-'}</Text>
                <TouchableOpacity onPress={onToggleBookmark} style={styles.bookmarkButton}>
                    <Icon
                        name={isBookmarked ? 'bookmark' : 'bookmark-o'}
                        size={28}
                        color={isBookmarked ? '#FFD700' : '#999'}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>기업 형태</Text>
                <Text style={styles.value}>{form.companyType || '-'}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>업종</Text>
                <Text style={styles.value}>{form.industry || '-'}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>직원 수</Text>
                <Text style={styles.value}>{form.employees || '-'}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>설립일</Text>
                <Text style={styles.value}>{form.establishedAt || '-'}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>회사 위치</Text>
                <Text style={styles.value}>{form.location || '-'}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>회사 연락처</Text>
                <Text style={styles.value}>{formatPhoneNumber(form.companyContact)}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>홈페이지</Text>
                <Text style={[styles.value, styles.homepageValue]}>{form.homepage || '-'}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>등록 채용공고 수</Text>
                <Text style={styles.value}>{jobCount}</Text>
            </View>

            <View style={styles.introContainer}>
                <Text style={styles.introLabel}>회사 소개</Text>
                <Text style={styles.introText}>{form.introduction || '-'}</Text>
            </View>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: wp('6%'),
        paddingVertical: hp('3%'),
        backgroundColor: '#fff',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('2%'),
    },
    companyName: {
        fontSize: wp('5%'),
        fontWeight: '700',
        color: '#222',
        flex: 1,
    },
    bookmarkButton: {
        padding: 8,
        marginLeft: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp('1.5%'),
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    label: {
        fontSize: wp('4.2%'),
        fontWeight: '700',
        color: '#222',
        flex: 1,
    },
    value: {
        fontSize: wp('4.2%'),
        color: '#444',
        flex: 1,
        textAlign: 'right',
    },
    homepageValue: {
        color: COLORS.THEMECOLOR,
        textDecorationLine: 'underline',
    },
    introContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: wp('4%'),
        marginTop: hp('2%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    introLabel: {
        fontSize: wp('4.2%'),
        fontWeight: '700',
        color: '#222',
        marginBottom: hp('1%'),
    },
    introText: {
        fontSize: wp('4%'),
        color: '#555',
        lineHeight: 22,
    },
});

