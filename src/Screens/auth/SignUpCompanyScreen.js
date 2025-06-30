import React, { useState } from "react";
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
import COLORS from "../../constants/colors";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

export default function SignUpCompanyScreen() {
    const navigation = useNavigation();
    const [form, setForm] = useState({
        username: "",
        password: "",
        company: "",
        bizNumber: "",
        manager: "",
        email: "",
        phone: "",
        verifyCode: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const validateForm = () => {
        const usernameRegex = /^[a-z0-9]{8,16}$/;
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,16}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const bizNumberRegex = /^\d{10}$/;
        const phoneRegex = /^\d{10,11}$/;

        if (!usernameRegex.test(form.username)) {
            Alert.alert("입력 오류", "아이디는 8~16자의 영문 소문자와 숫자만 가능합니다.");
            return false;
        }

        if (!passwordRegex.test(form.password)) {
            Alert.alert("입력 오류", "비밀번호는 8~16자, 영문/숫자/특수문자를 포함해야 합니다.");
            return false;
        }

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
    const handleSignUp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const apiUrl = "http://192.168.0.19:4000/api/signup";

            const postData = {
                userType: "기업",
                username: form.username,
                password: form.password,
                company: form.company,
                bizNumber: form.bizNumber,
                manager: form.manager,
                email: form.email,
                phone: form.phone,
            };

            const response = await axios.post(apiUrl, postData);

            if (response.status === 200 || response.status === 201) {
                Alert.alert("가입 성공", "회원가입이 완료되었습니다.", [
                    { text: "확인", onPress: () => navigation.navigate("LoginScreen") },
                ]);
            } else {
                Alert.alert("가입 실패", "서버 응답 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert(
                "가입 실패",
                error.response?.data?.message || error.message || "오류가 발생했습니다."
            );
        } finally {
            setLoading(false);
        }
    };



    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.typeSelector}>
                    <Text style={{ fontWeight: "bold", fontSize: wp("4%") }}>
                        기업회원 가입하기
                    </Text>
                </View>
                <View style={{ marginTop: 40 }}></View>

                <View style={styles.formContainer}>

                    <View
                        style={{
                            marginBottom: 20,
                            borderBottomWidth: 1,
                            borderColor: "#ccc",
                            paddingBottom: 10,
                        }}
                    >
                        {/* 아이디 */}
                        <View style={styles.inputRow}>
                            <Text style={styles.label}>아이디</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder="8~16자 영문소문자, 숫자"
                                value={form.username}
                                onChangeText={(text) => handleChange("username", text)}
                                autoCapitalize="none"
                            />
                        </View>

                        {/* 비밀번호 */}
                        <View style={styles.inputRow}>
                            <Text style={styles.label}>비밀번호</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder="8~16자 영문, 숫자, 특수문자"
                                secureTextEntry
                                value={form.password}
                                onChangeText={(text) => handleChange("password", text)}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                    {/* 기업명 */}
                    <View style={styles.inputRow}>
                        <Text style={styles.label}>기업명</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="기업명을 입력해 주세요"
                            value={form.company}
                            onChangeText={(text) => handleChange("company", text)}
                        />
                    </View>

                    {/* 사업자번호 */}
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

                    {/* 담당자 */}
                    <View style={styles.inputRow}>
                        <Text style={styles.label}>담당자</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="실명을 입력해 주세요"
                            value={form.manager}
                            onChangeText={(text) => handleChange("manager", text)}
                        />
                    </View>

                    {/* 이메일 */}
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
                            style={styles.smallButton}
                            onPress={() => Alert.alert("인증번호 발송 기능 준비중")}
                        >
                            <Text style={styles.smallButtonText}>인증번호 발송</Text>
                        </TouchableOpacity>
                    </View>
                    {/* 인증번호 */}
                    <View style={styles.inputRow}>
                        <Text style={styles.label}>인증번호</Text>
                        <TextInput
                            style={[styles.inputField, { flex: 1 }]}
                            placeholder="인증번호 입력"
                            keyboardType="numeric"
                            value={form.verifyCode}
                            onChangeText={(text) => handleChange("verifyCode", text)}
                        />
                        <TouchableOpacity
                            style={styles.smallButton}
                            onPress={() => Alert.alert("인증번호 확인 기능 준비중")}
                        >
                            <Text style={styles.smallButtonText}>확인</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 휴대폰 번호 */}
                    <View style={styles.inputRow}>
                        <Text style={styles.label}>휴대폰 번호</Text>
                        <TextInput
                            style={[styles.inputField, { flex: 1 }]}
                            placeholder="- 제외 숫자만 입력"
                            keyboardType="numeric"
                            value={form.phone}
                            onChangeText={(text) => handleChange("phone", text)}
                        />
                    </View>


                    <TouchableOpacity
                        style={[styles.signupBtn, loading && { backgroundColor: "#aaa" }]}
                        onPress={handleSignUp}
                        disabled={loading}
                    >
                        <Text style={styles.signupText}>
                            {loading ? "가입 중..." : "가입하기"}
                        </Text>
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
        marginTop: hp('5%'),
        paddingBottom: hp('3.7%'),
        alignItems: "center",
        paddingHorizontal: wp('5.3%'),
    },
    formContainer: {
        width: wp("90%")
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp('1.8%'),
        gap: wp('1.3%'),
    },
    label: {
        width: wp('18.7%'),
        fontSize: wp('3.7%'),
        fontWeight: "500",
        marginRight: wp('1.3%'),
    },
    inputField: {
        flex: 1,
        backgroundColor: "#F7F7F7",
        borderRadius: wp('2.1%'),
        paddingHorizontal: wp('4%'),
        height: hp('5.5%'),
        borderWidth: 1,
        borderColor: "#ddd",
        fontSize: wp('3.7%'),
    },
    smallButton: {
        borderWidth: 1,
        borderColor: "#555",
        paddingVertical: hp('1.2%'),
        paddingHorizontal: wp('2.1%'),
        borderRadius: wp('2.1%'),
    },
    smallButtonText: {
        color: "black",
        fontWeight: "bold",
        fontSize: wp('3.5%'),
    },
    signupBtn: {
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: hp('1.5%'),
        borderRadius: wp('2.1%'),
        alignItems: "center",
        marginTop: hp('1.2%'),
    },
    signupText: {
        color: "#fff",
        fontSize: wp('4.3%'),
        fontWeight: "bold",
    },
});