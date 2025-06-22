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
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const SignUpCompanyScreen = () => {
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

    const handleSignUp = async () => {
        if (!form.username || !form.password) {
            Alert.alert("입력 오류", "아이디와 비밀번호는 필수입니다.");
            return;
        }

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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>
            </View>
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
                            placeholder="번호 입력"
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
};

export default SignUpCompanyScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    scrollContainer: {
        paddingBottom: 30,
        alignItems: "center",
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    formContainer: { width: wp("90%") },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        gap: 5,
    },
    label: {
        width: 70,
        fontSize: 14,
        fontWeight: "500",
        marginRight: 5,
    },
    inputField: {
        flex: 1,
        backgroundColor: "#F7F7F7",
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 45,
        borderWidth: 1,
        borderColor: "#ddd",
        fontSize: 14,
    },
    smallButton: {
        borderWidth: 1,
        borderColor: "#555",
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    smallButtonText: {
        color: "black",
        fontWeight: "bold",
        fontSize: 13,
    },
    signupBtn: {
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    signupText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
