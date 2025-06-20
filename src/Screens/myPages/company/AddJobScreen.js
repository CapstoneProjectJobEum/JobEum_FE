import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import COLORS from '../../../constants/colors';

const AddJobScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            title: '',
            company: '',
            location: '',
            deadline: '',
            career: '',
            education: '',
            detail: '',
            summary: '',
            condition: '',
        },
    });

    const [jobConditions, setJobConditions] = useState(null);

    // 채용 조건 설정하기 화면에서 데이터가 넘어오면 처리
    useEffect(() => {
        if (route.params?.jobConditions) {
            setJobConditions(route.params.jobConditions);
            console.log('JobRequirementsForm에서 넘어온 조건:', route.params.jobConditions);
        }
    }, [route.params?.jobConditions]);

    const onSubmit = async (formData) => {
        if (!formData.title.trim() || !formData.company.trim()) {
            Alert.alert('입력 오류', '채용공고 제목과 회사명은 필수 입력 사항입니다.');
            return;
        }

        if (!jobConditions) {
            Alert.alert('입력 오류', '채용 조건을 설정해주세요.');
            return;
        }

        const fullData = {
            ...formData,
            jobConditions: JSON.stringify(jobConditions), // ✅ 이거 꼭!
        };

        try {
            // const res = await axios.post('http://10.106.2.70:4000/api/jobs', fullData);
            const res = await axios.post('http://192.168.0.19:4000/api/jobs', fullData);

            console.log('전송 성공:', res.data);
            Alert.alert('등록 완료', '채용공고가 성공적으로 등록되었습니다.');
            reset();
            setJobConditions(null);
        } catch (error) {
            if (error.response) {
                console.error('응답 오류:', error.response.status, error.response.data);
                Alert.alert('전송 실패', `오류 코드: ${error.response.status}`);
            } else if (error.request) {
                console.error('요청은 보냈지만 응답 없음:', error.request);
                Alert.alert('전송 실패', '서버 응답이 없습니다.');
            } else {
                console.error('기타 오류:', error.message);
                Alert.alert('전송 실패', error.message);
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {[
                { name: 'title', label: '채용공고 제목 *', placeholder: '제목을 입력하세요' },
                { name: 'company', label: '회사명 *', placeholder: '회사명을 입력하세요' },
                { name: 'location', label: '회사 위치', placeholder: '예: 서울시 강남구' },
                { name: 'deadline', label: '지원 마감일', placeholder: '예: 2025-12-31' },
                { name: 'career', label: '경력', placeholder: '예: 신입, 경력 3년 이상' },
                { name: 'education', label: '학력', placeholder: '예: 학력무관' },
                { name: 'detail', label: '채용 상세 내용', placeholder: '이런 업무를 해요', multiline: true },
                { name: 'summary', label: '채용 조건 요약', placeholder: '이런 분들 찾고 있어요', multiline: true },
                { name: 'condition', label: '기타 조건', placeholder: '예: 복지, 근무 형태 등', multiline: true },
            ].map(({ name, label, placeholder, multiline }) => (
                <View key={name}>
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
                            />
                        )}
                    />
                </View>
            ))}

            <TouchableOpacity
                style={styles.subButton}
                onPress={() => navigation.navigate('JobRequirementsForm', {
                    onSubmitConditions: (data) => {
                        navigation.setParams({ jobConditions: data });
                    },
                })}
            >
                <Text style={styles.subButtonText}>채용 조건 설정하기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.buttonText}>등록하기</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
        marginTop: 12,
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
        textAlignVertical: 'top',
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
    subButton: {
        marginTop: 16,
        backgroundColor: '#f0f0f0',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    subButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default AddJobScreen;
