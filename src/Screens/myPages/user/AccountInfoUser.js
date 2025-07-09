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
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

import { BASE_URL } from '@env';

export default function AccountInfoUser() {
    const navigation = useNavigation();
    const [form, setForm] = useState({
        name: "",
        birth: "",
        gender: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        console.log(BASE_URL);
    }, []);

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
        if (field === "email") setIsVerified(false);
    };

    const validateForm = () => {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,16}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const birthRegex = /^\d{8}$/;
        const phoneRegex = /^\d{10,11}$/;

        if (!form.username) {
            Alert.alert("입력 오류", "아이디를 입력해 주세요.");
            return false;
        }

        if (!passwordRegex.test(form.password)) {
            Alert.alert("입력 오류", "비밀번호는 8~16자, 영문/숫자/특수문자를 포함해야 합니다.");
            return false;
        }

        if (!form.name) {
            Alert.alert("입력 오류", "이름을 입력해 주세요.");
            return false;
        }

        if (!birthRegex.test(form.birth)) {
            Alert.alert("입력 오류", "생년월일은 8자리 숫자로 입력해주세요. (예: 20000101)");
            return false;
        }

        if (!form.gender) {
            Alert.alert("입력 오류", "성별을 선택해 주세요.");
            return false;
        }

        if (!emailRegex.test(form.email)) {
            Alert.alert("입력 오류", "유효한 이메일 형식이 아닙니다.");
            return false;
        }

        if (!isVerified) {
            Alert.alert("이메일 인증 필요", "이메일 인증을 완료해 주세요.");
            return false;
        }

        if (!phoneRegex.test(form.phone)) {
            Alert.alert("입력 오류", "휴대폰 번호는 숫자만 10~11자리 입력해 주세요.");
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
                        <Text style={styles.label}>이름</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="실명을 입력해 주세요"
                            value={form.name}
                            onChangeText={(text) => handleChange("name", text)}
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>생년월일</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="예) YYYYMMDD"
                            keyboardType="numeric"
                            value={form.birth}
                            onChangeText={(text) => handleChange("birth", text)}
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>성별</Text>
                        <View style={styles.genderContainer}>
                            <TouchableOpacity
                                style={[styles.genderBtn, form.gender === "남자" && styles.genderBtnSelected]}
                                onPress={() => handleChange("gender", "남자")}
                            >
                                <Text
                                    style={[styles.genderText, form.gender === "남자" && styles.genderTextSelected]}
                                >
                                    남자
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.genderBtn, form.gender === "여자" && styles.genderBtnSelected]}
                                onPress={() => handleChange("gender", "여자")}
                            >
                                <Text
                                    style={[styles.genderText, form.gender === "여자" && styles.genderTextSelected]}
                                >
                                    여자
                                </Text>
                            </TouchableOpacity>
                        </View>
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
    genderContainer: {
        flexDirection: "row",
        gap: wp("2.6%"),
        flex: 1,
    },
    genderBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: wp("2.1%"),
        paddingVertical: hp("1.2%"),
        alignItems: "center",
    },
    genderBtnSelected: {
        borderColor: COLORS.THEMECOLOR,
    },
    genderText: {
        color: "#333",
        fontSize: wp("3.7%"),
    },
    genderTextSelected: {
        color: COLORS.THEMECOLOR,
        fontWeight: "bold",
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
