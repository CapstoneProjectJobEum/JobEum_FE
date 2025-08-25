import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView, ScrollView, Alert, } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from "axios";
import { BASE_URL } from '@env';
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";

export default function SignUpPersonalScreen() {
    const navigation = useNavigation();
    const [form, setForm] = useState({
        username: "",
        password: "",
        name: "",
        birth: "",
        gender: "",
        email: "",
        phone: "",
        verifyCode: "",
    });
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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

    const sendVerifyCode = async () => {
        try {
            if (!form.username || !form.email || !form.phone) {
                Alert.alert("입력 오류", "아이디, 이메일, 휴대폰 번호를 모두 입력해주세요.");
                return;
            }

            const dupRes = await axios.post(`${BASE_URL}/api/check-duplicate`, {
                username: form.username,
                email: form.email,
                phone: form.phone,
            });

            if (!dupRes.data.success) {
                const dupField = dupRes.data.field;
                const dupMsg = dupRes.data.message || `${dupField}가 이미 사용 중입니다.`;
                Alert.alert("중복 확인 실패", dupMsg);
                return;
            }

            const res = await axios.post(`${BASE_URL}/api/send-code`, { email: form.email, userType: "개인회원" });
            if (res.data.success) {
                Alert.alert("발송 완료", "인증번호가 전송되었습니다.");
            } else {
                Alert.alert("발송 실패", res.data.message || "전송에 실패했습니다.");
            }
        } catch (err) {
            Alert.alert("오류", err.response?.data?.message || "요청 처리 중 오류가 발생했습니다.");
        }
    };


    const verifyCode = async () => {
        if (!form.email || !form.verifyCode) {
            Alert.alert("입력 오류", "이메일과 인증번호를 모두 입력해 주세요.");
            return;
        }
        try {
            setLoading(true);
            const response = await axios.post(`${BASE_URL}/api/verify-code`, {
                email: form.email,
                verifyCode: form.verifyCode,
            });
            if (response.data.success) {
                Alert.alert("성공", "인증번호가 확인되었습니다.");
                setIsVerified(true);
            } else {
                Alert.alert("실패", response.data.message || "인증번호 확인에 실패했습니다.");
                setIsVerified(false);
            }
        } catch (error) {
            Alert.alert("오류", error.response?.data?.message || error.message || "서버 오류 발생");
            setIsVerified(false);
        } finally {
            setLoading(false);
        }
    };


    const handleSignUp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/api/signup`, {
                userType: "개인회원",
                username: form.username,
                password: form.password,
                name: form.name,
                birth: form.birth,
                gender: form.gender,
                email: form.email,
                phone: form.phone,
            });

            if (response.status === 200 || response.status === 201) {


                console.log("🚀 회원가입 요청 데이터:", {
                    userType: "개인회원",
                    username: form.username,
                    password: form.password,
                    name: form.name,
                    birth: form.birth,
                    gender: form.gender,
                    email: form.email,
                    phone: form.phone,
                });



                Alert.alert("가입 성공", "회원가입이 완료되었습니다.", [
                    { text: "확인", onPress: () => navigation.navigate("LoginScreen") },
                ]);
            } else {
                Alert.alert("가입 실패", "서버 응답 오류가 발생했습니다.");
            }
        } catch (error) {
            Alert.alert("가입 실패", error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };



    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.typeSelector}>
                    <Text style={{ fontWeight: "bold", fontSize: wp("4%") }}>개인회원 가입하기</Text>
                </View>

                <View style={{ marginTop: 40 }} />

                <View style={styles.formContainer}>
                    <View style={{ marginBottom: 20, borderBottomWidth: 1, borderColor: "#ccc", paddingBottom: 10 }}>
                        {/* 아이디 */}
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

                        {/* 비밀번호 */}
                        <View style={styles.inputRow}>
                            <Text style={styles.label}>비밀번호</Text>
                            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                                <TextInput
                                    style={[styles.inputField, { flex: 1 }]}
                                    placeholder="8~16자 영문, 숫자, 특수문자"
                                    secureTextEntry={!isPasswordVisible}
                                    value={form.password}
                                    onChangeText={(text) => handleChange("password", text)}
                                    autoCapitalize="none"
                                />
                                {form.password.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.iconBtn}
                                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                        accessibilityLabel={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={isPasswordVisible ? "eye" : "eye-off"}
                                            size={22}
                                            color="#888"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>

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
                        <TouchableOpacity style={styles.smallButton} onPress={sendVerifyCode}>
                            <Text style={styles.smallButtonText}>인증번호 발송</Text>
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
                        <TouchableOpacity style={styles.smallButton} onPress={verifyCode}>
                            <Text style={styles.smallButtonText}>확인</Text>
                        </TouchableOpacity>
                    </View>


                    <TouchableOpacity
                        style={[
                            styles.signupBtn,
                            (loading || !isVerified) && { backgroundColor: "#aaa" },
                            isVerified && !loading && { backgroundColor: COLORS.THEMECOLOR },
                        ]}
                        onPress={handleSignUp}
                        disabled={loading || !isVerified}
                    >
                        <Text style={styles.signupText}>가입하기</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    scrollContainer: {
        marginTop: hp("5%"),
        paddingBottom: hp("3.7%"),
        alignItems: "center",
        paddingHorizontal: wp("5.3%"),
    },
    formContainer: {
        width: wp("90%")
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
    genderContainer: {
        flexDirection: "row",
        flex: 1,
    },
    genderBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: wp("2.1%"),
        paddingVertical: hp("1.2%"),
        alignItems: "center",
        marginRight: wp("2.6%"),
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
    smallButton: {
        borderWidth: 1,
        borderColor: "#555",
        paddingVertical: hp("1.2%"),
        paddingHorizontal: wp("2.1%"),
        borderRadius: wp("2.1%"),
    },
    smallButtonText: {
        color: "black",
        fontWeight: "bold",
        fontSize: wp("3.5%"),
    },
    signupBtn: {
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: hp("1.5%"),
        borderRadius: wp("2.1%"),
        alignItems: "center",
        marginTop: hp("1.2%"),
    },
    signupText: {
        color: "#fff",
        fontSize: wp("4.3%"),
        fontWeight: "bold",
    },
    iconBtn: {
        position: "absolute",
        right: wp("3.5%"),
        top: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        width: wp("8%"),
        height: "100%",
        zIndex: 10,
    },
});
