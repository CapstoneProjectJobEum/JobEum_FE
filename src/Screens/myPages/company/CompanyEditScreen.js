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

const industryOptions = ['IT', '제조', '교육', '금융', '의료', '서비스', '기타'];
const employeeOptions = ['1~50명', '51~200명', '201~500명', '501~1000명', '1000명 이상'];


export default function CompanyEditScreen() {
    const [form, setForm] = useState({
        company: '',
        companyContact: '',
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
        if (!form.company.trim()) {
            Alert.alert('입력 오류', '기업명을 입력해 주세요.');
            return;
        }
        Alert.alert('저장 완료', '기업 정보가 저장되었습니다.');
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
                        activeOpacity={0.7}
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
            <InputRow label="기업명" field="company" value={form.company} onChange={handleChange} placeholder="기업명을 입력해 주세요" />

            <Text style={styles.label}>업종</Text>
            {renderButtonGroup('industry', industryOptions)}


            <Text style={styles.label}>직원 수</Text>
            {renderButtonGroup('employees', employeeOptions)}

            <InputRow label="설립일" field="establishedAt" value={form.establishedAt} onChange={handleChange} placeholder="예) YYYYMMDD" />
            <InputRow label="회사 위치" field="location" value={form.location} onChange={handleChange} placeholder="회사 주소를 입력해 주세요" />
            <InputRow label="회사 연락처" field="companyContact" value={form.companyContact} onChange={handleChange} placeholder="지역번호 포함 숫자만" keyboardType="numeric" />
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
