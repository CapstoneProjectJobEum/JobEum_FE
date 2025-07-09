import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import COLORS from '../../../constants/colors';
import SCREENS from '../..';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import BottomSpacer from '../../../navigation/BottomSpacer';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const careerOptions = ['신입', '경력 1~3년', '경력 4~6년', '경력 7년 이상'];
const educationOptions = ['학력 무관', '고졸 이상', '대졸 이상', '석사 이상', '박사 이상'];

export default function AddJobScreen() {
    const navigation = useNavigation();
    const route = useRoute();

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

    useEffect(() => {
        const fetchUserInfo = async () => {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                setUserId(userInfo.id);
            }
        };
        fetchUserInfo();
    }, []);

    useFocusEffect(
        useCallback(() => {
            console.log('route.params:', route.params);

            if (route.params?.disability_requirements) {
                setDisabilityRequirements(route.params.disability_requirements);
                setShowSetComplete(true);
            } else {
                setDisabilityRequirements(null);
                setShowSetComplete(false);
            }

            if (route.params?.formData) {
                reset(route.params.formData);
            }
            if (route.params?.images) {
                setImages(route.params.images);
            }
        }, [route.params, reset])
    );


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

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImagesToServer = async (imageUris) => {
        const formData = new FormData();

        imageUris.forEach((uri, index) => {
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

        let formattedDeadline = null;
        if (formData.deadline && formData.deadline.length === 8) {
            const d = formData.deadline;
            formattedDeadline = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
        }

        try {
            // 1) 이미지 서버 업로드
            const localUris = images.map(img => img.uri);
            const uploadedImageUrls = await uploadImagesToServer(localUris);

            // 2) 업로드된 URL 포함 데이터 생성
            const fullData = {
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
                images: uploadedImageUrls,
            };

            // 3) 채용공고 등록 API 호출
            await axios.post(`${BASE_URL}/api/jobs`, fullData);

            Alert.alert('등록 완료', '채용공고가 성공적으로 등록되었습니다.');
            reset();
            setDisabilityRequirements(null);
            setImages([]);
            setShowSetComplete(false);

            navigation.navigate('RouteScreen', {
                screen: 'MainTab',
                params: {
                    screen: 'MY',
                    params: {
                        screen: 'CompanyMyScreen',
                        params: { selectedTab: '채용공고 관리' },
                    },
                },
            });
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

    const handleSetCondition = () => {
        navigation.navigate('JobRequirementsForm', {
            disability_requirements: disabilityRequirements || {},
            formData: getValues(),
            images,
        });
    };

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

            <TouchableOpacity
                style={styles.subButton}
                onPress={handleSetCondition}
            >
                <Text style={styles.subButtonText}>채용 조건 설정하기</Text>
            </TouchableOpacity>

            {showSetComplete && (
                <View style={styles.completeMessageContainer}>
                    <Text style={styles.completeMessageText}>채용 조건이 설정되었습니다.</Text>
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.buttonText}>등록하기</Text>
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
