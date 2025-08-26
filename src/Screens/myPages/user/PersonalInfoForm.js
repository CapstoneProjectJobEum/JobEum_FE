import React, { useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import Checkbox from 'expo-checkbox';
import COLORS from '../../../constants/colors';

const disabilityGrades = ['심한 장애', '심하지 않은 장애', '정보 없음'];

const disabilityTypesList = [
    '시각 장애', '청각 장애', '지체 장애', '지적 장애',
    '뇌병변 장애', '언어 장애', '신장 장애', '심장 장애',
    '간질(뇌전증) 장애', '호흡기 장애', '정신 장애', '기타'
];

const assistiveDevicesList = [
    '휠체어 사용', '보청기 사용', '점자 사용', '지팡이 사용',
    '보조공학기기 사용', '수화 통역 지원 필요', '별도 휴식시간 필요',
    '작업환경 조정 필요', '없음'
];

const jobInterestList = [
    '사무 · 행정', '회계 · 재무', 'IT · 개발', '디자인 · 편집',
    '제조 · 생산 · 단순노무', '상담 · 고객지원', '번역 · 통역',
    '교육 · 강의', '마케팅 · 홍보', '영업 · 판매', '연구 · 엔지니어링',
    '농업 · 환경', '문화 · 예술 · 체육', '기타'
];

const preferredWorkTypeList = [
    '재택근무 가능', '사무실 출근 가능', '파트타임 선호',
    '풀타임 선호', '시간제 가능', '유연근무 가능',
    '장애인 전용 채용', '일반 채용 참여 희망'
];

export default function PersonalInfoForm() {
    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            disabilityTypes: [],
            disabilityGrade: '',
            assistiveDevices: [],
            preferredWorkType: [],
            jobInterest: [],
        }
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const userInfoStr = await AsyncStorage.getItem('userInfo');
                const token = await AsyncStorage.getItem('accessToken');
                if (!userInfoStr || !token) return;

                const userInfo = JSON.parse(userInfoStr);

                const res = await axios.get(`${BASE_URL}/api/user-profile/${userInfo.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // 서버에 데이터 없거나 404 발생 시 초기화(방어 코드)
                const profile = res.data || {};
                reset({
                    disabilityTypes: profile.disability_types ? profile.disability_types.split(',') : [],
                    disabilityGrade: profile.disability_grade || '',
                    assistiveDevices: profile.assistive_devices ? profile.assistive_devices.split(',') : [],
                    preferredWorkType: profile.preferred_work_type ? profile.preferred_work_type.split(',') : [],
                    jobInterest: profile.job_interest ? profile.job_interest.split(',') : [],
                });
            } catch (error) {

                // 404 등 모든 오류 발생 시에도 빈 배열로 초기화(방어 코드)
                reset({
                    disabilityTypes: [],
                    disabilityGrade: '',
                    assistiveDevices: [],
                    preferredWorkType: [],
                    jobInterest: [],
                });
            }
        };
        loadProfile();
    }, [reset]);


    const toggleArrayItem = (array, item) => {
        if (array.includes(item)) {
            return array.filter(i => i !== item);
        } else {
            return [...array, item];
        }
    };

    const onSubmit = async (data) => {
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            const token = await AsyncStorage.getItem('accessToken');
            if (!userInfoStr || !token) {
                Alert.alert('오류', '로그인 정보가 없습니다.');
                return;
            }

            const userInfo = JSON.parse(userInfoStr);
            const payload = {
                userId: userInfo.id,
                ...data,
            };

            const res = await axios.put(`${BASE_URL}/api/user-profile`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                Alert.alert('성공', '프로필이 저장되었습니다.');
            } else {
                Alert.alert('실패', res.data.message || '저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('전송 오류:', error);
            Alert.alert('오류', error.response?.data?.message || '서버 오류가 발생했습니다.');
        }
    };


    const renderCheckboxGroup = (name, list) => (
        <Controller
            control={control}
            name={name}
            render={({ field: { value, onChange } }) => (
                <View style={styles.checkboxGroup}>
                    {list.map((item, idx) => {
                        const selected = value.includes(item);
                        return (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.checkboxContainer, selected && styles.checkboxSelected]}
                                onPress={() => onChange(toggleArrayItem(value, item))}
                                activeOpacity={0.7}
                            >
                                <Checkbox
                                    value={selected}
                                    onValueChange={() => onChange(toggleArrayItem(value, item))}
                                    color={selected ? COLORS.THEMECOLOR : undefined}
                                    style={styles.checkbox}
                                />
                                <Text style={[styles.checkboxLabel, selected && styles.checkboxLabelSelected]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        />
    );

    const renderRadioGroup = (name, list) => (
        <Controller
            control={control}
            name={name}
            render={({ field: { value, onChange } }) => (
                <View style={styles.checkboxGroup}>
                    {list.map((item, idx) => {
                        const selected = value === item;
                        return (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.checkboxContainer, selected && styles.checkboxSelected]}
                                onPress={() => onChange(item)}
                                activeOpacity={0.7}
                            >
                                <Checkbox
                                    value={selected}
                                    onValueChange={() => onChange(item)}
                                    color={selected ? COLORS.THEMECOLOR : undefined}
                                    style={styles.checkbox}
                                />
                                <Text style={[styles.checkboxLabel, selected && styles.checkboxLabelSelected]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        />
    );

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionTitle}>장애 등급 (하나만 선택)</Text>
            {renderRadioGroup('disabilityGrade', disabilityGrades)}

            <Text style={styles.sectionTitle}>장애 유형</Text>
            {renderCheckboxGroup('disabilityTypes', disabilityTypesList)}

            <Text style={styles.sectionTitle}>보조기기 사용 여부</Text>
            {renderCheckboxGroup('assistiveDevices', assistiveDevicesList)}

            <Text style={styles.sectionTitle}>직무 분야</Text>
            {renderCheckboxGroup('jobInterest', jobInterestList)}

            <Text style={styles.sectionTitle}>근무 가능 형태</Text>
            {renderCheckboxGroup('preferredWorkType', preferredWorkTypeList)}


            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.btnfont}>설정하기</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
        marginTop: 20,
        color: 'black',
    },
    checkboxGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 10,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fafafa',
    },
    checkboxSelected: {
        borderColor: COLORS.THEMECOLOR,
        backgroundColor: '#e6f0ff',
    },
    checkbox: {
        opacity: 0,
        position: 'absolute',
        width: 0,
        height: 0,
        marginLeft: -15,
    },
    checkboxLabel: {
        fontSize: 14,
        color: 'black',
        textAlign: 'center',
    },
    checkboxLabelSelected: {
        color: COLORS.THEMECOLOR,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: COLORS.THEMECOLOR,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    btnfont: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
