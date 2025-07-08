import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useForm, Controller } from 'react-hook-form';
import COLORS from '../../../constants/colors';
import BottomSpacer from '../../../navigation/BottomSpacer';

const disabilityTypesList = [
    '시각 장애', '청각 장애', '지체 장애', '지적 장애',
    '언어 장애', '신장 장애', '호흡기 장애', '기타'
];

const assistiveDevicesList = [
    '휠체어 사용', '보청기 사용', '점자 사용', '지팡이 사용', '보조공학기기 사용'
];

const jobInterestList = [
    '사무보조', '디자인', 'IT/프로그래밍', '제조/생산',
    '상담/고객 응대', '번역/통역', '교육/강의', '마케팅/홍보', '기타'
];

const disabilityGrades = ['심한 장애', '심하지 않은 장애', '정보 없음'];

const workTypesList = [
    '재택근무 가능', '사무실 출근 가능', '파트타임 선호', '풀타임 선호', '시간제 가능'
];


export default function JobRequirementsForm({ navigation, route }) {
    const { control, handleSubmit } = useForm({
        defaultValues: {
            disabilityTypes: [],
            disabilityGrade: '',
            assistiveDevices: [],
            preferredWorkType: [],
            jobInterest: [],
        }
    });

    const toggleArrayItem = (array, item) => (
        array.includes(item) ? array.filter(i => i !== item) : [...array, item]
    );

    const onSubmit = (data) => {
        const { onSubmitConditions } = route.params || {};
        if (onSubmitConditions) {
            onSubmitConditions(data); // 👉 AddJobScreen으로 데이터 전달
        }
        navigation.goBack(); // 👉 이전 화면으로 이동
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
                                <Text style={[styles.checkboxLabel, selected && styles.checkboxLabelSelected]}>{item}</Text>
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
                                <Text style={[styles.checkboxLabel, selected && styles.checkboxLabelSelected]}>{item}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        />
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.sectionTitle}>장애 유형</Text>
            {renderCheckboxGroup('disabilityTypes', disabilityTypesList)}

            <Text style={styles.sectionTitle}>장애 등급 (하나만 선택)</Text>
            {renderRadioGroup('disabilityGrade', disabilityGrades)}

            <Text style={styles.sectionTitle}>보조기기 사용 여부</Text>
            {renderCheckboxGroup('assistiveDevices', assistiveDevicesList)}

            <Text style={styles.sectionTitle}>근무 가능 형태</Text>
            {renderCheckboxGroup('preferredWorkType', workTypesList)}

            <Text style={styles.sectionTitle}>희망 직무 분야</Text>
            {renderCheckboxGroup('jobInterest', jobInterestList)}

            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.btnfont}>확인하기</Text>
            </TouchableOpacity>

            <BottomSpacer />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff'
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
        marginTop: 20,
        color: 'black'
    },
    checkboxGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 10
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
        borderColor: COLORS.THEMECOLOR
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
        textAlign: 'center'

    },
    checkboxLabelSelected: {
        color: COLORS.THEMECOLOR,
        fontWeight: 'bold'
    },
    button: {
        backgroundColor: COLORS.THEMECOLOR,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
    },
    btnfont: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16
    },
});

