import React, { useState, useCallback, useEffect, } from 'react';
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import COLORS from '../../../constants/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';

const companyTypeList = [
    '대기업', '중견 기업', '강소 기업', '중소 기업', '외국계 기업',
    '스타트업', '공기업', '사회적기업',
];

const industryOptions = [
    '식음료·외식', 'IT 개발', '디자인', '마케팅·광고', '고객 서비스',
    '경영·사무', '물류·운송', '교육', '생산·제조', '건설·엔지니어링',
];

const employeeOptions = ['1~50명', '51~200명', '201~500명', '501~1000명', '1000명 이상'];

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
                    const token = await AsyncStorage.getItem("accessToken"); // 토큰 가져오기
                    if (!userInfo || !token) return;

                    const parsed = JSON.parse(userInfo);
                    if (parsed.userType !== "기업회원" || !parsed.id) return;

                    // 기본 회원 정보 호출
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

        // 회사 연락처: 숫자 9~11자리
        // 국내 전화번호 정규식 (서울/기타 지역번호/이동전화/8자리 특수번호)
        const companyContactRegex = /^(01[016789]\d{7,8}|02\d{7,8}|0[3-9]\d\d{7,8}|\d{8})$/;

        if (form.companyContact && !companyContactRegex.test(form.companyContact)) {
            Alert.alert(
                '입력 오류',
                '회사 연락처를 올바르게 입력해 주세요.'
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
            console.error('기업 정보 수정 오류:', error);
            Alert.alert('저장 실패', error.response?.data?.message || '서버 오류가 발생했습니다.');
        }
    };


    const renderButtonGroup = (field, options) => (
        <View style={styles.buttonGroup}>
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
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.inputRow}>
                <Text style={styles.label}>기업명</Text>
                <TextInput
                    style={styles.inputField}
                    placeholder="기업명을 입력해 주세요"
                    value={form.company}
                    onChangeText={text => handleChange('company', text)}
                />
            </View>

            <Text style={styles.label}>기업 형태</Text>
            {renderButtonGroup('companyType', companyTypeList)}

            <Text style={styles.label}>업종</Text>
            {renderButtonGroup('industry', industryOptions)}

            <Text style={styles.label}>직원 수</Text>
            {renderButtonGroup('employees', employeeOptions)}

            <InputRow
                label="설립일"
                field="establishedAt"
                value={form.establishedAt}
                onChange={handleChange}
                placeholder="예) YYYYMMDD"
            />
            <InputRow
                label="회사 위치"
                field="location"
                value={form.location}
                onChange={handleChange}
                placeholder="회사 주소를 입력해 주세요"
            />

            <InputRow
                label={
                    <Text>
                        회사 연락처{" "}
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
                <Text style={styles.label}>회사 소개</Text>
                <TextInput
                    style={[styles.inputField, { height: hp('15%'), textAlignVertical: 'top' }]}
                    placeholder="회사에 대한 소개를 입력해 주세요"
                    multiline
                    numberOfLines={6}
                    value={form.introduction}
                    onChangeText={text => handleChange('introduction', text)}
                />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>수정하기</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const InputRow = ({ label, field, value, onChange, placeholder, keyboardType = 'default', autoCapitalize = 'sentences' }) => (
    <View style={styles.inputRow}>
        <Text style={styles.label}>{label}</Text>
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
        paddingHorizontal: wp('6%'),
        paddingVertical: hp('3%'),
        backgroundColor: '#fff',
    },
    inputRow: {
        marginBottom: hp('2%'),
    },
    label: {
        fontSize: wp('4.2%'),
        fontWeight: '600',
        marginBottom: hp('0.8%'),
        color: '#333',
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
    saveButton: {
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: hp('1.5%'),
        borderRadius: 8,
        alignItems: 'center',
        marginTop: hp('3%'),
    },
    saveButtonText: {
        color: '#fff',
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
    },
    buttonGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 10,
        marginBottom: hp('2%'),
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
    checkboxLabel: {
        fontSize: wp('4%'),
        color: 'black',
        textAlign: 'center',
    },
    checkboxLabelSelected: {
        color: COLORS.THEMECOLOR,
        fontWeight: 'bold',
    },
});
