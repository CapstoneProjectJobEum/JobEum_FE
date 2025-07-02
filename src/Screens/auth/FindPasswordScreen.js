import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../constants/colors";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "http://localhost:4000";

export default function FindPasswordScreen() {
    const navigation = useNavigation();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [form, setForm] = useState({
        username: '',
        email: '',
        verifyCode: '',
        password: '',
    });
    const [isVerified, setIsVerified] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const userInfoString = await AsyncStorage.getItem('userInfo');
            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                setIsLoggedIn(true);
                setIsVerified(true);
                setToken(userInfo.token); // 여기서 토큰 꺼내기
            } else {
                setIsLoggedIn(false);
                setIsVerified(false);
                setToken(null);
            }
        };
        checkLoginStatus();
    }, []);

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
        if (field === "email") setIsVerified(false);
    };

    const validateBeforeSend = () => {
        if (isLoggedIn) return true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.username.trim()) {
            Alert.alert("입력 오류", "아이디를 입력해 주세요.");
            return false;
        }
        if (!form.email.trim()) {
            Alert.alert("입력 오류", "이메일을 입력해 주세요.");
            return false;
        }
        if (!emailRegex.test(form.email)) {
            Alert.alert("입력 오류", "유효한 이메일 형식이 아닙니다.");
            return false;
        }
        return true;
    };

    const validatePassword = () => {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,16}$/;
        if (!form.password.trim()) {
            Alert.alert("입력 오류", "새 비밀번호를 입력해 주세요.");
            return false;
        }
        if (!passwordRegex.test(form.password)) {
            Alert.alert(
                "입력 오류",
                "비밀번호는 8~16자 이내이며, 영문, 숫자, 특수문자를 모두 포함해야 합니다."
            );
            return false;
        }
        return true;
    };

    // sendVerifyCode(), verifyCode() 함수는 로그인 상태면 숨기거나 비활성화 처리 (생략)

    const resetPassword = async () => {
        if (!validateBeforeSend()) return;
        if (!validatePassword()) return;

        try {
            const payload = {
                password: form.password,
                ...(isLoggedIn ? {} : { username: form.username, email: form.email }),
            };

            const headers = {};
            if (isLoggedIn && token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const res = await axios.post(
                `${BASE_URL}/api/reset-password`,
                payload,
                { headers }
            );

            if (res.data.success) {
                Alert.alert("성공", "비밀번호가 변경되었습니다.", [
                    {
                        text: "확인",
                        onPress: async () => {
                            await AsyncStorage.removeItem('accessToken');
                            await AsyncStorage.removeItem('userInfo');
                            navigation.reset({
                                index: 0,
                                routes: [{ name: "LoginScreen" }],
                            });
                        },
                    },
                ]);
            } else {
                Alert.alert("실패", res.data.message || "비밀번호 변경 실패");
            }
        } catch (err) {
            Alert.alert("오류", err.response?.data?.message || "비밀번호 변경 중 오류 발생");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.form}>
                    {!isLoggedIn && (
                        <>
                            <View style={styles.inputRow}>
                                <Text style={styles.label}>아이디</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="아이디 입력"
                                    value={form.username}
                                    onChangeText={(text) => handleChange("username", text)}
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputRow}>
                                <Text style={styles.label}>이메일</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="example@email.com"
                                    keyboardType="email-address"
                                    value={form.email}
                                    onChangeText={(text) => {
                                        handleChange("email", text);
                                        setIsVerified(false);
                                    }}
                                    autoCapitalize="none"
                                />
                                {/* 인증번호 발송 버튼 등 필요 시 넣기 */}
                            </View>

                            <View style={styles.inputRow}>
                                <Text style={styles.label}>인증번호</Text>
                                <TextInput
                                    style={[styles.inputField, { flex: 1 }]}
                                    placeholder="인증번호 입력"
                                    keyboardType="numeric"
                                    value={form.verifyCode}
                                    onChangeText={(text) => handleChange("verifyCode", text)}
                                />
                                {/* 인증번호 확인 버튼 등 필요 시 넣기 */}
                            </View>
                        </>
                    )}

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>새 비밀번호</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="8~16자 영문, 숫자, 특수문자"
                            secureTextEntry={!isPasswordVisible}
                            value={form.password}
                            onChangeText={(text) => handleChange("password", text)}
                            autoCapitalize="none"
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                        />
                        {passwordFocused && (
                            <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                accessibilityLabel={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                            >
                                <Ionicons
                                    name={isPasswordVisible ? "eye" : "eye-off"}
                                    size={20}
                                    color="#ccc"
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity style={styles.button} onPress={resetPassword}>
                        <Text style={styles.buttonText}>비밀번호 재설정</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    scrollContainer: { marginTop: hp('5%'), paddingBottom: hp("3.7%"), alignItems: "center" },
    form: { width: wp("90%") },
    inputRow: { flexDirection: "row", alignItems: "center", marginBottom: hp("1.8%"), gap: wp("1.3%") },
    label: { width: wp("18.7%"), fontSize: wp("3.7%"), fontWeight: "500", marginRight: wp("1.3%") },
    inputField: {
        flex: 1,
        backgroundColor: "#F7F7F7",
        borderRadius: wp("2.1%"),
        paddingHorizontal: wp("4%"),
        height: hp("5.5%"),
        borderWidth: 1,
        borderColor: "#ddd",
        fontSize: wp("3.7%"),
    },
    button: {
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: hp("1.5%"),
        borderRadius: wp("2.1%"),
        alignItems: "center",
        marginTop: hp("3.7%"),
    },
    buttonText: {
        color: "#fff",
        fontSize: wp("4.3%"),
        fontWeight: "bold",
    },
    iconBtn: { position: "absolute", right: wp("3.5%") },
});
