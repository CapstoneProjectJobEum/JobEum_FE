import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import COLORS from '../../../constants/colors';

export default function AddResumeScreen() {
    const navigation = useNavigation();

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            title: '',
            personalInfo: '',
            desiredJob: '',
            education: '',
            career: '',
            selfIntroduction: '',
            certificates: '',
            internshipActivities: '',
            preferencesMilitary: '',
            workConditions: '',
        },
    });

    const onSubmit = async (formData) => {
        if (!formData.title.trim()) {
            Alert.alert('입력 오류', '이력서 제목을 입력해주세요.');
            return;
        }

        // 생성일
        const newResume = {
            ...formData,
            createdAt: new Date().toISOString().slice(0, 10),
            isDefault: false,
        };

        try {
            const res = await axios.post('http://192.168.0.19:4000/api/resumes', newResume);
            console.log('이력서 등록 성공:', res.data);
            Alert.alert('등록 완료', '이력서가 성공적으로 추가되었습니다.');
            reset();
            navigation.goBack();
        } catch (error) {
            console.error('이력서 등록 실패:', error);
            Alert.alert('등록 실패', '이력서 등록 중 오류가 발생했습니다.');
        }
    };

    const fields = [
        { name: 'title', label: '이력서 제목 *', placeholder: '예: 백엔드 개발자 이력서', multiline: false },
        { name: 'personalInfo', label: '인적사항', placeholder: '이름, 연락처 등', multiline: true },
        { name: 'desiredJob', label: '희망직무', placeholder: '예: 프론트엔드 개발자', multiline: false },
        { name: 'education', label: '학력', placeholder: '최종 학력 및 학교명', multiline: false },
        { name: 'career', label: '경력', placeholder: '예: 경력 3년 이상', multiline: false },
        { name: 'selfIntroduction', label: '자기소개서', placeholder: '자기소개 내용을 작성하세요', multiline: true },
        { name: 'certificates', label: '자격증', placeholder: '보유 자격증', multiline: false },
        { name: 'internshipActivities', label: '인턴 / 대외활동', placeholder: '인턴 경험 및 대외활동', multiline: true },
        { name: 'preferencesMilitary', label: '취업우대/병역', placeholder: '취업 우대 사항 및 병역 정보', multiline: true },
        { name: 'workConditions', label: '희망 근무 조건', placeholder: '근무 시간, 지역 등', multiline: true },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {fields.map(({ name, label, placeholder, multiline }) => (
                <View key={name} style={styles.fieldWrapper}>
                    <Text style={styles.label}>{label}</Text>
                    <Controller
                        control={control}
                        name={name}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, multiline && styles.textArea]}
                                placeholder={placeholder}
                                value={value}
                                onChangeText={onChange}
                                multiline={multiline}
                                textAlignVertical={multiline ? 'top' : 'auto'}
                            />
                        )}
                    />
                </View>
            ))}

            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.buttonText}>등록하기</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    fieldWrapper: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },
    textArea: {
        height: 100,
    },
    button: {
        marginTop: 30,
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
});
