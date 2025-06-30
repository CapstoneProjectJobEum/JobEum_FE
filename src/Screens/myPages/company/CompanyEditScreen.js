import React, { useState } from 'react';
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


export default function CompanyEditScreen() {
    const [form, setForm] = useState({
        company: '',
        bizNumber: '',
        manager: '',
        email: '',
        phone: '',
        introduction: '',
        location: '',
        industry: '',
        establishedAt: '',
        employees: '',
        homepage: '',
    });

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        // TODO: 저장 API 연동
        Alert.alert('저장 완료', '기업 정보가 저장되었습니다.');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <InputRow label="기업명" field="company" value={form.company} onChange={handleChange} placeholder="기업명을 입력해 주세요" />
            <InputRow label="사업자번호" field="bizNumber" value={form.bizNumber} onChange={handleChange} placeholder="숫자만 입력" keyboardType="numeric" />
            <InputRow label="담당자" field="manager" value={form.manager} onChange={handleChange} placeholder="실명을 입력해 주세요" />
            <InputRow label="이메일" field="email" value={form.email} onChange={handleChange} placeholder="example@email.com" keyboardType="email-address" />
            <InputRow label="회사 연락처" field="phone" value={form.phone} onChange={handleChange} placeholder="지역번호 포함 숫자만" keyboardType="phone-pad" />
            <InputRow label="업종" field="industry" value={form.industry} onChange={handleChange} placeholder="예: IT, 제조, 교육 등" />
            <InputRow label="설립일" field="establishedAt" value={form.establishedAt} onChange={handleChange} placeholder="YYYY-MM-DD" />
            <InputRow label="직원 수" field="employees" value={form.employees} onChange={handleChange} placeholder="숫자만 입력" keyboardType="numeric" />
            <InputRow label="홈페이지" field="homepage" value={form.homepage} onChange={handleChange} placeholder="https://yourcompany.com" autoCapitalize="none" />

            <View style={styles.inputRow}>
                <Text style={styles.label}>회사 소개</Text>
                <TextInput
                    style={[styles.inputField, { height: hp('15%'), textAlignVertical: 'top' }]}
                    placeholder="회사에 대한 소개를 입력해 주세요"
                    multiline
                    numberOfLines={6}
                    value={form.introduction}
                    onChangeText={(text) => handleChange('introduction', text)}
                />
            </View>

            <InputRow label="회사 위치" field="location" value={form.location} onChange={handleChange} placeholder="회사 주소를 입력해 주세요" />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>저장하기</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const InputRow = ({
    label,
    field,
    value,
    onChange,
    placeholder,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
}) => (
    <View style={styles.inputRow}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.inputField}
            placeholder={placeholder}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            value={value}
            onChangeText={(text) => onChange(field, text)}
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
        marginBottom: hp('5%'),
    },
    saveButtonText: {
        color: '#fff',
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
    },
});
