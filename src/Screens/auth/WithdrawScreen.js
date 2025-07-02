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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../constants/colors";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from "axios";
import { BASE_URL } from '@env';

export default function WithdrawScreen() {
    const navigation = useNavigation();
    const [form, setForm] = useState({
        email: '',
        verifyCode: '',
        userType: '', // ✅ userType 포함
    });
    const [isVerified, setIsVerified] = useState(false);
    const [snsProvider, setSnsProvider] = useState('');
    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const stored = await AsyncStorage.getItem("userInfo");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setForm((prev) => ({
                        ...prev,
                        userType: parsed.userType || '',
                        email: parsed.email || '',
                    }));
                    setSnsProvider(parsed.snsProvider || '');

                    if (parsed.snsProvider) {
                        setIsVerified(true);  // 소셜 로그인 유저는 인증 완료로 초기 설정
                    }
                }
            } catch (err) {
                console.warn("userInfo 로딩 실패:", err);
            }
        };
        loadUserInfo();
    }, []);


    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
        if (field === "email") setIsVerified(false);
    };

    const validateBeforeSend = () => {
        if (form.snsProvider) return true; // 소셜 로그인 시 인증번호 발송 절차 생략

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email.trim()) {
            Alert.alert("입력 오류", "이메일을 입력해 주세요.");
            return false;
        }
        if (!emailRegex.test(form.email)) {
            Alert.alert("입력 오류", "유효한 이메일 형식이 아닙니다.");
            return false;
        }
        if (!["개인회원", "기업회원"].includes(form.userType)) {
            Alert.alert("입력 오류", "회원 유형이 올바르지 않습니다.");
            return false;
        }
        return true;
    };

    const sendVerifyCode = async () => {
        if (form.snsProvider) return; // 소셜 로그인 시 인증번호 발송 생략

        if (!validateBeforeSend()) return;

        try {
            const res = await axios.post(`${BASE_URL}/api/send-code`, {
                email: form.email,
                userType: form.userType,
            });

            if (res.data.success) {
                Alert.alert("성공", "인증번호가 이메일로 발송되었습니다.");
            } else {
                Alert.alert("실패", res.data.message || "인증번호 발송 실패");
            }
        } catch (err) {
            Alert.alert("오류", err.response?.data?.message || "서버 오류 발생");
        }
    };

    const verifyCode = async () => {
        if (form.snsProvider) {
            setIsVerified(true); // 소셜 로그인 시 바로 인증 처리
            return;
        }

        if (!form.verifyCode.trim()) {
            Alert.alert("입력 오류", "인증번호를 입력해 주세요.");
            return;
        }

        try {
            const res = await axios.post(`${BASE_URL}/api/verify-code`, {
                email: form.email,
                verifyCode: form.verifyCode,
            });

            if (res.data.success) {
                Alert.alert("인증 성공", "이메일 인증이 완료되었습니다.");
                setIsVerified(true);
            } else {
                Alert.alert("인증 실패", res.data.message || "인증번호가 올바르지 않습니다.");
                setIsVerified(false);
            }
        } catch (err) {
            Alert.alert("오류", err.response?.data?.message || "인증번호 확인 오류 발생");
            setIsVerified(false);
        }
    };

    const withdrawUser = async () => {
        if (!isVerified) {
            Alert.alert("인증 필요", "이메일 인증을 완료해 주세요.");
            return;
        }

        try {
            const stored = await AsyncStorage.getItem("userInfo");
            const userInfo = stored ? JSON.parse(stored) : {};

            const payload = userInfo.snsProvider && userInfo.snsId
                ? { sns_id: userInfo.snsId, sns_provider: userInfo.snsProvider }
                : { email: form.email };

            const res = await axios.post(`${BASE_URL}/api/withdraw`, payload);

            if (res.data.success) {
                Alert.alert("탈퇴 완료", "회원 탈퇴가 완료되었습니다.", [
                    { text: "확인", onPress: () => navigation.navigate("LoginScreen") },
                ]);
            } else {
                Alert.alert("실패", res.data.message || "회원 탈퇴 실패");
            }
        } catch (err) {
            Alert.alert("오류", err.response?.data?.message || "회원 탈퇴 중 오류 발생");
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.form}>
                    {!snsProvider && (
                        <>
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
                                <TouchableOpacity style={styles.smallBtn} onPress={sendVerifyCode}>
                                    <Text style={styles.smallBtnText}>인증번호 발송</Text>
                                </TouchableOpacity>
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
                                <TouchableOpacity style={styles.smallBtn} onPress={verifyCode}>
                                    <Text style={styles.smallBtnText}>확인</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    <TouchableOpacity style={styles.button} onPress={withdrawUser}>
                        <Text style={styles.buttonText}>회원 탈퇴</Text>
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
        marginTop: hp('5%'),
        paddingBottom: hp("3.7%"),
        alignItems: "center",
    },
    form: {
        width: wp("90%"),
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp("1.8%"),
        gap: wp("1.3%"),
    },
    label: {
        width: wp("18.7%"),
        fontSize: wp("3.7%"),
        fontWeight: "500",
        marginRight: wp("1.3%"),
    },
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
    smallBtn: {
        borderWidth: 1,
        borderColor: "#555",
        paddingVertical: hp("1.2%"),
        paddingHorizontal: wp("2.1%"),
        borderRadius: wp("2.1%"),
    },
    smallBtnText: {
        color: "black",
        fontWeight: "bold",
        fontSize: wp("3.5%"),
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
});
