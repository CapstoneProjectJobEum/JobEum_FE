import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, Image
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import COLORS from '../../../constants/colors';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import BottomSpacer from '../../../navigation/BottomSpacer';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const careerOptions = ['신입', '경력 1~3년', '경력 4~6년', '경력 7년 이상'];
const educationOptions = ['학력 무관', '고졸 이상', '대졸 이상', '석사 이상', '박사 이상'];

export default function EditJobScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params || {};  // 수정할 공고 id

    const { control, handleSubmit, reset, getValues } = useForm({
        defaultValues: {
            title: '',
            company: '',
            location: '',
            deadline: '',
            career: '',
            education: '',
            detail: '',
            summary: '',
            working_conditions: '',
        },
    });

    const [disabilityRequirements, setDisabilityRequirements] = useState(null);
    const [images, setImages] = useState([]);
    const [showSetComplete, setShowSetComplete] = useState(false);
    const [userId, setUserId] = useState(null);


    // 유저 정보 불러오기
    useEffect(() => {
        AsyncStorage.getItem('userInfo').then(str => {
            if (str) setUserId(JSON.parse(str).id);
        });
    }, []);

    // 공고 상세 불러오기
    useEffect(() => {
        if (!id) return;

        const fetchJob = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/jobs/${id}`);
                const job = res.data;

                // "YYYY-MM-DD" → "YYYYMMDD" 변환 (deadline)
                const formattedDeadline = job.deadline ? job.deadline.replace(/-/g, '') : '';

                reset({
                    title: job.title || '',
                    company: job.company || '',
                    location: job.location || '',
                    deadline: formattedDeadline,
                    career: job.career || '',
                    education: job.education || '',
                    detail: job.detail || '',
                    summary: job.summary || '',
                    working_conditions: job.working_conditions || '',
                });

                setDisabilityRequirements(job.disability_requirements || null);
                setImages((job.images || []).map(url => ({ uri: url })));
                setShowSetComplete(Boolean(job.disability_requirements));
            } catch (error) {
                Alert.alert('불러오기 실패', '채용공고 정보를 불러오는 중 오류가 발생했습니다.');
            }
        };

        fetchJob();
    }, [id, reset]);

    // 사진 선택
    const handleSelectPhoto = async () => {
        if (images.length >= 4) {
            Alert.alert('사진은 최대 4장까지 등록 가능합니다.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const selectedUri = result.assets[0].uri;
            setImages(prev => [...prev, { uri: selectedUri }]);
        }
    };

    // 이미지 삭제
    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // 이미지 서버 업로드 함수 (로컬 URI만 업로드)
    const uploadImagesToServer = async (imageUris) => {
        const formData = new FormData();

        imageUris.forEach((uri) => {
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;
            formData.append('images', {
                uri,
                name: filename,
                type,
            });
        });

        const res = await axios.post(`${BASE_URL}/api/jobs/upload-images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (!res.data.success) {
            throw new Error('이미지 업로드 실패');
        }

        return res.data.imageUrls;
    };

    // 제출 (수정) 함수
    const onSubmit = async (formData) => {
        if (!userId) {
            Alert.alert('사용자 정보가 없습니다. 다시 로그인 해주세요.');
            return;
        }
        if (!formData.title.trim() || !formData.company.trim()) {
            Alert.alert('입력 오류', '채용공고 제목과 회사명은 필수 입력 사항입니다.');
            return;
        }
        if (images.length === 0) {
            Alert.alert('입력 오류', '최소 1장의 사진을 등록해주세요.');
            return;
        }
        if (!disabilityRequirements) {
            Alert.alert('입력 오류', '채용 조건을 설정해주세요.');
            return;
        }
        if (formData.deadline && formData.deadline.length !== 8) {
            Alert.alert('입력 오류', '지원 마감일은 8자리 (YYYYMMDD) 형식으로 입력해주세요.');
            return;
        }

        try {
            // 로컬 URI만 업로드
            const localUris = images.filter(img => !img.uri.startsWith('http')).map(img => img.uri);
            const uploadedImageUrls = localUris.length > 0 ? await uploadImagesToServer(localUris) : [];

            // 기존 http URL과 새 업로드 URL 합치기
            const finalImageUrls = [
                ...images.filter(img => img.uri.startsWith('http')).map(img => img.uri),
                ...uploadedImageUrls,
            ];

            // deadline 포맷팅
            const d = formData.deadline;
            const formattedDeadline = d.length === 8
                ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
                : null;

            // 수정 API 호출 (PUT)
            await axios.put(`${BASE_URL}/api/jobs/${id}`, {
                user_id: userId,
                title: formData.title,
                company: formData.company,
                location: formData.location || null,
                deadline: formattedDeadline,
                career: formData.career,
                education: formData.education,
                detail: formData.detail || null,
                summary: formData.summary || null,
                working_conditions: formData.working_conditions || null,
                disability_requirements: disabilityRequirements || null,
                images: finalImageUrls,
            });

            Alert.alert('수정 완료', '채용공고가 성공적으로 수정되었습니다.');
            navigation.goBack();
        } catch (error) {
            if (error.response) {
                Alert.alert('전송 실패', `오류 코드: ${error.response.status}`);
            } else if (error.request) {
                Alert.alert('전송 실패', '서버 응답이 없습니다.');
            } else {
                Alert.alert('전송 실패', error.message);
            }
        }
    };

    // 채용 조건 설정하기 (기존 코드 재사용)
    const handleSetCondition = () => {
        navigation.navigate('JobRequirementsForm', {
            disability_requirements: disabilityRequirements || {},
            formData: getValues(),
            images,
        });
    };

    // 버튼 그룹 렌더링 함수 (기존 코드 재사용)
    const renderButtonGroup = (name, options) => (
        <Controller
            control={control}
            name={name}
            render={({ field: { value, onChange } }) => (
                <View style={styles.buttonGroup}>
                    {options.map(option => {
                        const selected = value === option;
                        return (
                            <TouchableOpacity
                                key={option}
                                style={[styles.checkboxContainer, selected && styles.checkboxSelected]}
                                onPress={() => onChange(option)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.checkboxLabel, selected && styles.checkboxLabelSelected]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        />
    );

    return (
        <ScrollView style={{ backgroundColor: '#fff' }} contentContainerStyle={styles.container}>
            {[
                { name: 'title', label: '채용공고 제목 *', placeholder: '제목을 입력하세요' },
                { name: 'company', label: '회사명 *', placeholder: '회사명을 입력하세요' },
                { name: 'location', label: '회사 위치', placeholder: '예: 서울시 강남구' },
                { name: 'deadline', label: '지원 마감일', placeholder: '예: YYYYMMDD' },
                { name: 'detail', label: '채용 상세 내용', placeholder: '이런 업무를 해요', multiline: true },
                { name: 'summary', label: '채용 조건 요약', placeholder: '이런 분들 찾고 있어요', multiline: true },
                { name: 'working_conditions', label: '기타 조건', placeholder: '예: 복지, 근무 형태 등', multiline: true },
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
                                scrollEnabled={multiline}
                                showsVerticalScrollIndicator={multiline}
                            />
                        )}
                    />
                </View>
            ))}

            <Text style={styles.label}>경력</Text>
            {renderButtonGroup('career', careerOptions)}

            <Text style={styles.label}>학력</Text>
            {renderButtonGroup('education', educationOptions)}

            <TouchableOpacity
                style={[styles.subButton, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: hp(2) }]}
                onPress={handleSelectPhoto}
            >
                <FontAwesome name="image" size={wp(5)} color="#333" />
                <Text style={[styles.subButtonText, { marginLeft: wp(2) }]}>회사 사진 등록하기  ({images.length}/4)</Text>
            </TouchableOpacity>

            <View style={styles.imagePreviewContainer}>
                {images.map((image, index) => (
                    <View key={index} style={styles.imageWrapper}>
                        <Image source={{ uri: image.uri }} style={styles.imageBox} />
                        <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeBtn}>
                            <FontAwesome name="close" size={12} color="white" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.subButton} onPress={handleSetCondition}>
                <Text style={styles.subButtonText}>채용 조건 설정하기</Text>
            </TouchableOpacity>

            {showSetComplete && (
                <View style={styles.completeMessageContainer}>
                    <Text style={styles.completeMessageText}>채용 조건이 설정되었습니다.</Text>
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.buttonText}>수정하기</Text>
            </TouchableOpacity>

            <BottomSpacer />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: wp(5),
        backgroundColor: '#fff',
    },
    label: {
        fontSize: wp(4),
        fontWeight: '600',
        marginBottom: hp(0.8),
        marginTop: hp(1.5),
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: wp(1.5),
        paddingHorizontal: wp(3),
        paddingVertical: hp(1.2),
        fontSize: wp(4),
        backgroundColor: '#fafafa',
    },
    textArea: {
        height: hp(12),
        textAlignVertical: 'top',
    },
    buttonGroup: {
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
        marginTop: hp(4),
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: hp(1.8),
        borderRadius: wp(2),
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: wp(5),
        fontWeight: '700',
    },
    subButton: {
        marginTop: hp(1.5),
        backgroundColor: '#f0f0f0',
        paddingVertical: hp(1.5),
        borderRadius: wp(2),
        alignItems: 'center',
    },
    subButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: wp(4),
    },
    imagePreviewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: hp('2%'),
        marginHorizontal: wp('5%'),
    },
    imageWrapper: {
        marginRight: wp('2%'),
        marginBottom: wp('2%'),
    },
    imageBox: {
        width: wp('18%'),
        height: wp('18%'),
        borderRadius: 8,
    },
    removeBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 10,
        padding: 3,
    },
    completeMessageContainer: {
        marginTop: hp(0.5),
        alignItems: 'center',
        paddingVertical: hp(0.5),
    },
    completeMessageText: {
        color: '#003366',
        fontSize: wp(4),
        fontWeight: '600',
    },
});
