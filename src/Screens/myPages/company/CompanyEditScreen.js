import React, { useState, useCallback, } from 'react';
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import COLORS from '../../../constants/colors';

const companyTypeList = [
    '대기업', '중견기업', '중소기업', '강소기업', '외국계 기업',
    '스타트업', '공기업', '공공기관', '사회적기업'
];

const industryOptions = [
    'SW‧앱 개발', '웹‧디자인', '경영‧사무', '데이터‧QA', '고객 상담',
    '마케팅‧홍보', '헬스‧복지', '제조‧생산', '예술‧창작', '교육‧지원'
];

const employeeOptions = [
    '1~10명', '11~50명', '51~200명', '201~500명',
    '501~1000명', '1001~5000명', '5000명 이상'
];

export default function CompanyEditScreen() {
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
        bizNumber: '',
        manager: '',
        email: '',
        phone: '',
    });

    useFocusEffect(
        useCallback(() => {
            const fetchCompanyInfo = async () => {
                try {
                    const userInfo = await AsyncStorage.getItem("userInfo");
                    const token = await AsyncStorage.getItem("accessToken");
                    if (!userInfo || !token) return;

                    const parsed = JSON.parse(userInfo);
                    if (parsed.userType !== "기업회원" || !parsed.id) return;

                    const resUser = await axios.get(
                        `${BASE_URL}/api/account-info/${parsed.id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    setForm((prev) => ({
                        ...prev,
                        company: resUser.data.company || "",
                        bizNumber: resUser.data.biz_number || "",
                        manager: resUser.data.manager || "",
                        email: resUser.data.email || "",
                        phone: resUser.data.phone || "",
                    }));

                    // 상세 프로필 호출
                    try {
                        const resProfile = await axios.get(
                            `${BASE_URL}/api/company-profile/${parsed.id}`,
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            }
                        );

                        setForm((prev) => ({
                            ...prev,
                            companyType: resProfile.data.company_type || "",
                            industry: resProfile.data.industry || "",
                            employees: resProfile.data.employees || "",
                            establishedAt: resProfile.data.established_at || "",
                            location: resProfile.data.location || "",
                            companyContact: resProfile.data.company_contact || "",
                            homepage: resProfile.data.homepage || "",
                            introduction: resProfile.data.introduction || "",
                        }));
                    } catch (err) {
                        console.log("company-profile 불러오기 실패:", err);
                    }
                } catch (error) {
                    console.log("기업 정보 불러오기 오류:", error);
                }
            };

            fetchCompanyInfo();
        }, [])
    );

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        // 설립일: 8자리 숫자(YYYYMMDD)
        const establishedAtRegex = /^\d{8}$/;
        if (form.establishedAt && !establishedAtRegex.test(form.establishedAt)) {
            Alert.alert('입력 오류', '설립일은 숫자 8자리(YYYYMMDD) 형식이어야 합니다.');
            return false;
        }

        // 기업 연락처: 숫자 9~11자리
        // 국내 전화번호 정규식 (서울/기타 지역번호/이동전화/8자리 특수번호)
        const companyContactRegex = /^(01[016789]\d{7,8}|02\d{7,8}|0[3-9]\d\d{7,8}|\d{8})$/;

        if (form.companyContact && !companyContactRegex.test(form.companyContact)) {
            Alert.alert(
                '입력 오류',
                '기업 연락처를 올바르게 입력해 주세요.'
            );
            return false;
        }


        // 홈페이지: http 또는 https 로 시작
        const urlRegex = /^https?:\/\/.+$/;
        if (form.homepage && form.homepage !== "해당없음" && !urlRegex.test(form.homepage)) {
            Alert.alert(
                '입력 오류',
                '홈페이지 주소는 http 또는 https로 시작해야 합니다.\n없을 경우 "해당없음"이라고 적어주세요.'
            );
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        if (!form.company.trim()) {
            Alert.alert('입력 오류', '기업명을 입력해 주세요.');
            return;
        }
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            const token = await AsyncStorage.getItem("accessToken");
            if (!userInfo || !token) {
                Alert.alert('오류', '로그인 정보가 없습니다.');
                return;
            }
            const parsed = JSON.parse(userInfo);

            // 기본 회원 정보 저장
            const resUser = await axios.put(
                `${BASE_URL}/api/account-info/${parsed.id}`,
                {
                    user_type: '기업회원',
                    company: form.company,
                    bizNumber: form.bizNumber,
                    manager: form.manager,
                    email: form.email,
                    phone: form.phone,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // 상세 프로필 저장
            const resProfile = await axios.put(
                `${BASE_URL}/api/company-profile`,
                {
                    user_id: parsed.id,
                    company_type: form.companyType,
                    industry: form.industry,
                    employees: form.employees,
                    establishedAt: form.establishedAt,
                    location: form.location,
                    companyContact: form.companyContact,
                    homepage: form.homepage,
                    introduction: form.introduction,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (resUser.data.success && resProfile.data.success) {
                Alert.alert('저장 완료', '기업 정보가 성공적으로 수정되었습니다.');
            } else {
                Alert.alert('저장 실패', resUser.data.message || resProfile.data.message || '알 수 없는 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('기업정보 수정 오류:', error);
            Alert.alert('저장 실패', error.response?.data?.message || '서버 오류가 발생했습니다.');
        }
    };


    const rendercheckboxGroup = (field, options) => (
        <View style={styles.checkboxGroup}>
            {options.map(option => {
                const selected = form[field] === option;
                return (
                    <TouchableOpacity
                        key={option}
                        style={[styles.checkboxContainer, selected && styles.checkboxSelected]}
                        onPress={() => handleChange(field, option)}
                        activeOpacity={1}
                    >
                        <Text style={[styles.checkboxLabel, selected && styles.checkboxLabelSelected]}>
                            {option}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                extraScrollHeight={5}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.formContainer}>

                        <View style={styles.inputRow}>
                            <Text style={styles.sectionTitle}>기업명</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder="기업명을 입력해 주세요"
                                value={form.company}
                                onChangeText={text => handleChange('company', text)}
                            />
                        </View>

                        <Text style={styles.sectionTitle}>기업 형태</Text>
                        {rendercheckboxGroup('companyType', companyTypeList)}

                        <Text style={[styles.sectionTitle, { marginTop: hp('1%') }]}>업무</Text>
                        {rendercheckboxGroup('industry', industryOptions)}

                        <Text style={[styles.sectionTitle, { marginTop: hp('1%') }]}>직원 수</Text>
                        {rendercheckboxGroup('employees', employeeOptions)}

                        <View style={{ marginTop: hp('1%') }}>
                            <InputRow
                                label="설립일"
                                field="establishedAt"
                                value={form.establishedAt}
                                onChange={handleChange}
                                placeholder="예) YYYYMMDD"
                            />
                        </View>
                        <InputRow
                            label="기업 위치"
                            field="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="기업 주소를 입력해 주세요"
                        />

                        <InputRow
                            label={
                                <Text>
                                    기업 연락처{" "}
                                    <Text style={{ fontSize: 12, color: "#888" }}>
                                        (- 제외, 지역번호 포함)
                                    </Text>
                                </Text>
                            }
                            field="companyContact"
                            value={form.companyContact}
                            onChange={handleChange}
                            placeholder="- 제외 숫자만 입력"
                            keyboardType="numeric"
                        />

                        <InputRow
                            label={
                                <Text>
                                    홈페이지{" "}
                                    <Text style={{ fontSize: 12, color: "#888" }}>
                                        (없을 경우: 해당없음)
                                    </Text>
                                </Text>
                            }
                            field="homepage"
                            value={form.homepage}
                            onChange={handleChange}
                            placeholder="https://yourcompany.com"
                            autoCapitalize="none"
                        />


                        <View style={styles.inputRow}>
                            <Text style={styles.sectionTitle}>기업 소개</Text>
                            <TextInput
                                style={[styles.inputField, { height: hp('15%'), textAlignVertical: 'top' }]}
                                placeholder="기업에 대한 소개를 입력해 주세요"
                                multiline
                                numberOfLines={6}
                                value={form.introduction}
                                onChangeText={text => handleChange('introduction', text)}
                            />
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleSave}>
                            <Text style={styles.btnfont}>설정하기</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const InputRow = ({ label, field, value, onChange, placeholder, keyboardType = 'default', autoCapitalize = 'sentences' }) => (
    <View style={styles.inputRow}>
        <Text style={styles.sectionTitle}>{label}</Text>
        <TextInput
            style={styles.inputField}
            placeholder={placeholder}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            value={value}
            onChangeText={text => onChange(field, text)}
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContainer: {
        marginTop: hp("5%"),
        paddingBottom: hp("3.7%"),
        alignItems: "center",
        paddingHorizontal: wp("5.3%"),
    },
    formContainer: {
        width: wp("90%"),
    },
    sectionTitle: {
        fontSize: wp("4.5%"),
        fontWeight: "bold",
        marginBottom: hp("0.8%"),
        color: "#333",
    },
    inputRow: {
        marginBottom: hp('2%'),
    },
    inputField: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.2%'),
        fontSize: wp('4%'),
        backgroundColor: '#f9f9f9',
    },
    checkboxGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp('1.8%'),
        paddingVertical: hp('1.2%'),
        borderRadius: wp('2%'),
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fafafa',
        marginRight: wp('2%'),
        marginBottom: hp('1%'),
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
    },
    checkboxLabel: {
        fontSize: wp('4%'),
        color: 'black',
        textAlign: 'center',
    },
    checkboxLabelSelected: {
        color: COLORS.THEMECOLOR,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: hp("1.5%"),
        borderRadius: 8,
        alignItems: "center",
        marginTop: hp("3%"),
        marginBottom: hp("2%"),
    },
    btnfont: {
        color: '#fff',
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
    },
});
