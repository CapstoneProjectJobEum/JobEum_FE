import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    SafeAreaView,
    ScrollView,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../../constants/colors";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


import { BASE_URL } from '@env';


export default function AccountInfoCompany() {
    const navigation = useNavigation();
    const [form, setForm] = useState({

        company: "",
        bizNumber: "",
        manager: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        console.log(BASE_URL);
    }, []);

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const validateForm = () => {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,16}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const bizNumberRegex = /^\d{10}$/;
        const phoneRegex = /^\d{10,11}$/;

        if (!form.company) {
            Alert.alert("입력 오류", "기업명을 입력해 주세요.");
            return false;
        }

        if (!bizNumberRegex.test(form.bizNumber)) {
            Alert.alert("입력 오류", "사업자번호는 숫자 10자리로 입력해 주세요.");
            return false;
        }

        if (!form.manager) {
            Alert.alert("입력 오류", "담당자 이름을 입력해 주세요.");
            return false;
        }

        if (!emailRegex.test(form.email)) {
            Alert.alert("입력 오류", "유효한 이메일 형식이 아닙니다.");
            return false;
        }

        if (!phoneRegex.test(form.phone)) {
            Alert.alert("입력 오류", "휴대폰 번호는 숫자만 10~11자리로 입력해 주세요.");
            return false;
        }

        return true;
    };

    const handleSave = () => {
        if (!form.company.trim()) {
            Alert.alert('입력 오류', '기업명을 입력해 주세요.');
            return;
        }
        Alert.alert('저장 완료', '기업 정보가 저장되었습니다.');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                    <View style={styles.inputRow}>
                        <Text style={styles.label}>기업명</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="기업명을 입력해 주세요"
                            value={form.company}
                            onChangeText={(text) => handleChange("company", text)}
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>사업자번호</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="숫자만 입력해 주세요"
                            keyboardType="numeric"
                            value={form.bizNumber}
                            onChangeText={(text) => handleChange("bizNumber", text)}
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>담당자</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="실명을 입력해 주세요"
                            value={form.manager}
                            onChangeText={(text) => handleChange("manager", text)}
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>휴대폰번호</Text>
                        <TextInput
                            style={[styles.inputField, { flex: 1 }]}
                            placeholder="- 제외 숫자만 입력"
                            keyboardType="numeric"
                            value={form.phone}
                            onChangeText={(text) => handleChange("phone", text)}
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>이메일</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="example@email.com"
                            keyboardType="email-address"
                            value={form.email}
                            onChangeText={(text) => handleChange("email", text)}
                            autoCapitalize="none"
                        />
                    </View>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>저장하기</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
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
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.2%'),
        fontSize: wp('4%'),
        borderWidth: 1,
        borderColor: '#ccc',
        height: hp('5%'),
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
});
