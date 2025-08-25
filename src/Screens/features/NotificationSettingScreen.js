import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import COLORS from '../../constants/colors';

export default function NotificationSettingScreen() {
    const [settings, setSettings] = useState({
        all: true,
        member: {},
        company: {},
        admin: {}
    });

    const [role, setRole] = useState('MEMBER');
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        getUserInfo();
    }, []);

    useEffect(() => {
        if (userId && role) {
            fetchSettings();
        }
    }, [userId, role]);

    // AsyncStorage에서 userInfo 가져오기
    const getUserInfo = async () => {
        try {
            const userInfoString = await AsyncStorage.getItem('userInfo');
            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                setRole(userInfo.role);
                setUserId(userInfo.id);
            }
        } catch (err) {
            console.error('[getUserInfo]', err);
        }
    };

    // 서버에서 설정 불러오기
    const fetchSettings = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const res = await axios.get(`${BASE_URL}/api/notifications/settings?role=${role}`, {
                headers: { Authorization: `Bearer ${token}` }
            });


            const data = res.data;
            const roleKey = role === 'COMPANY' ? 'company' : role === 'ADMIN' ? 'admin' : 'member';

            setSettings({
                all: data.all_notifications === 1,
                member: roleKey === 'member' ? data.settings : {},
                company: roleKey === 'company' ? data.settings : {},
                admin: roleKey === 'admin' ? data.settings : {},
            });
        } catch (err) {
            console.error('[fetchSettings]', err);
            Alert.alert('불러오기 실패', '설정을 불러오는 중 오류가 발생했습니다.');
        }
    };

    // 토글
    const toggleSetting = (type, key) => {
        const roleKey = role === 'COMPANY' ? 'company' : role === 'ADMIN' ? 'admin' : 'member';
        let updatedSettings = { ...settings };

        if (type === 'all') {
            const newAll = !settings.all;
            updatedSettings.all = newAll;
            Object.keys(updatedSettings[roleKey]).forEach(k => updatedSettings[roleKey][k] = newAll ? 1 : 0);
        } else {
            updatedSettings[roleKey][key] = updatedSettings[roleKey][key] ? 0 : 1;
        }

        setSettings(updatedSettings);

        // DB 저장
        saveSettings({
            role,
            all_notifications: updatedSettings.all ? 1 : 0,
            settings: updatedSettings[roleKey]
        });
    };

    // DB 저장 함수
    const saveSettings = async (payload) => {
        if (!userId) return;
        try {
            const token = await AsyncStorage.getItem('accessToken');
            await axios.post(`${BASE_URL}/api/notifications/settings`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('[saveSettings]', err);
            Alert.alert('저장 실패', '설정 저장 중 오류가 발생했습니다.');
        }
    };

    // 스위치 렌더링
    const renderSwitches = () => {
        const roleKey = role === 'COMPANY' ? 'company' : role === 'ADMIN' ? 'admin' : 'member';
        const userSettings = settings[roleKey] || {};
        return Object.keys(userSettings).map((key) => (
            <View style={styles.switchRow} key={key}>
                <Text style={[styles.label, { color: settings.all ? '#333' : '#aaa' }]}>
                    {formatLabel(key)}
                </Text>
                <Switch
                    value={userSettings[key] === 1 && settings.all}
                    onValueChange={() => toggleSetting(roleKey, key)}
                    disabled={!settings.all}
                    trackColor={{ false: '#ccc', true: COLORS.THEMECOLOR }}
                    thumbColor={'#fff'}
                />
            </View>
        ));
    };

    const formatLabel = (key) => {
        const map = {
            newJobFromFollowedCompany: '관심 기업 신규 채용 공고',
            favoriteJobDeadline: '관심 공고 마감 임박',
            applicationStatusChange: '지원 현황 상태 변경 알림',

            empJobDeadline: '등록한 공고 마감 임박',
            adminDeletedJob: '관리자 채용공고 삭제 알림',
            newApplicant: '지원자 접수 알림',
            newInquiry: '문의 등록 알림',
            newReport: '신고 등록 알림',

            inquiryReportAnswered: '문의 및 신고 답변 알림',
        };
        return map[key] || key;
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.switchRow}>
                <Text style={[styles.label, styles.allLabel]}>모든 알림 끄기</Text>
                <Switch
                    value={settings.all}
                    onValueChange={() => toggleSetting('all')}
                    trackColor={{ false: '#ccc', true: COLORS.THEMECOLOR }}
                    thumbColor={'#fff'}
                />
            </View>
            {renderSwitches()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp('5%'),
        backgroundColor: '#fff'
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: hp('1%')
    },
    allLabel: {
        fontSize: wp('5%'),
        fontWeight: '700'
    },
    label: {
        fontSize: wp('4%'),
        fontWeight: '600',
        color: '#333'
    }
});
