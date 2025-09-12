import React, { useState, useEffect } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, } from "react-native";
import { useRoute } from "@react-navigation/native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from "axios";
import { BASE_URL } from '@env';
import COLORS from "../../constants/colors";

export default function FindIdScreen() {
    const route = useRoute();
    const userType = route.params?.userType || "개인회원";

    const [form, setForm] = useState({
        name: '',
        email: '',
        verifyCode: '',
    });

    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        console.log(BASE_URL);
    }, []);

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
        if (field === "email") setIsVerified(false);
    };

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!form.name.trim()) {
            Alert.alert("입력 오류", "이름을 입력해 주세요.");
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


    const sendVerifyCode = async () => {
        try {
            const res = await axios.post(`${BASE_URL}/api/send-code`, { email: form.email });

            if (res.data.success) {
                Alert.alert("발송 완료", "인증번호가 전송되었습니다.");
            } else {
                Alert.alert("발송 실패", res.data.message || "전송에 실패했습니다.");
            }
        } catch (err) {
            Alert.alert("오류", err.response?.data?.message || "인증번호 전송 오류 발생");
        }
    };

    const verifyCode = async () => {
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


    const handleFindId = async () => {
        console.log("handleFindId 호출됨");
        if (!isVerified) {
            Alert.alert("인증 필요", "이메일 인증을 완료해 주세요.");
            return;
        }
        if (!validateForm()) return;

        try {
            console.log("요청 보냄:", { userType, name: form.name, email: form.email });
            const res = await axios.post(`${BASE_URL}/api/find-id`, {
                userType,
                name: form.name,
                email: form.email,
            });
            if (res.data.success) {
                Alert.alert("아이디 찾기 성공", `회원님의 아이디는: ${res.data.username}`);
            } else {
                Alert.alert("실패", res.data.message || "등록된 아이디가 없습니다.");
            }
        } catch (err) {
            Alert.alert("오류", err.response?.data?.message || "서버 오류가 발생했습니다.");
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                extraScrollHeight={5}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.form}>
                        <View style={styles.inputRow}>
                            <Text style={styles.label}>{userType === "기업회원" ? "담당자명" : "이름"}</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder={userType === "기업회원" ? "담당자명을 입력해 주세요" : "실명을 입력해 주세요"}
                                value={form.name}
                                onChangeText={(text) => handleChange("name", text)}
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
                                onChangeText={(text) => handleChange("email", text)}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={styles.smallBtn} onPress={sendVerifyCode}>
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

                        <TouchableOpacity style={styles.button} onPress={handleFindId}>
                            <Text style={styles.buttonText}>아이디 찾기</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAwareScrollView>
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
        marginRight: wp("1.3%"),
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
        fontWeight: "bold"
    },
});
