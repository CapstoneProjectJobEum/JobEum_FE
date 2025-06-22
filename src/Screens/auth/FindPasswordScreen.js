import React, { useState } from "react";
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
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

const FindPasswordScreen = () => {
    const navigation = useNavigation();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [verifyCode, setVerifyCode] = useState("");
    const [password, setPassword] = useState("");
    const [isVerified, setIsVerified] = useState(false);

    const validateVerifyInputs = () => {
        const usernameRegex = /^[a-z0-9]{8,16}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const verifyCodeRegex = /^\d{4,}$/;

        if (!username.trim()) {
            Alert.alert("입력 오류", "아이디를 입력해 주세요.");
            return false;
        }

        if (!usernameRegex.test(username)) {
            Alert.alert("입력 오류", "아이디는 8~16자의 영문 소문자와 숫자만 가능합니다.");
            return false;
        }

        if (!email.trim() || !emailRegex.test(email)) {
            Alert.alert("입력 오류", "유효한 이메일을 입력해 주세요.");
            return false;
        }

        if (!verifyCodeRegex.test(verifyCode)) {
            Alert.alert("입력 오류", "인증번호는 숫자 4자리 이상으로 입력해 주세요.");
            return false;
        }

        return true;
    };

    const validatePasswordInput = () => {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,16}$/;

        if (!password.trim()) {
            Alert.alert("입력 오류", "새 비밀번호를 입력해 주세요.");
            return false;
        }

        if (!passwordRegex.test(password)) {
            Alert.alert(
                "입력 오류",
                "비밀번호는 8~16자 이내이며, 영문, 숫자, 특수문자를 모두 포함해야 합니다."
            );
            return false;
        }

        return true;
    };

    const handleVerify = async () => {
        if (!validateVerifyInputs()) return;

        try {
            const response = await fetch("http://192.168.0.19:4000/api/verify-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    verifyCode,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert("인증 성공", "인증번호가 확인되었습니다.");
                setIsVerified(true);
            } else {
                Alert.alert("인증 실패", data.message || "인증번호가 올바르지 않습니다.");
                setIsVerified(false);
            }
        } catch (error) {
            Alert.alert("오류", "서버와 통신 중 오류가 발생했습니다.");
            setIsVerified(false);
        }
    };

    const handleResetPassword = async () => {
        if (!isVerified) {
            Alert.alert("인증 필요", "먼저 인증번호 확인을 완료해 주세요.");
            return;
        }

        if (!validatePasswordInput()) return;

        try {
            const response = await fetch("http://192.168.0.19:4000/api/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert("성공", "비밀번호가 변경되었습니다.", [
                    {
                        text: "확인",
                        onPress: () => navigation.navigate("LoginScreen"),
                    },
                ]);
            } else {
                Alert.alert("실패", data.message || "비밀번호 변경에 실패했습니다.");
            }
        } catch (error) {
            Alert.alert("오류", "서버와 통신 중 오류가 발생했습니다.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.form}>
                    <View style={styles.inputRow}>
                        <Text style={styles.label}>아이디</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="아이디 입력"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>이메일</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="가입한 이메일 주소 입력"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={styles.smallBtn}
                            onPress={() => Alert.alert("인증번호 발송 기능 준비중")}
                        >
                            <Text style={styles.smallBtnText}>인증번호 발송</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>인증번호</Text>
                        <TextInput
                            style={[styles.inputField, { flex: 1 }]}
                            placeholder="인증번호 입력"
                            keyboardType="numeric"
                            value={verifyCode}
                            onChangeText={setVerifyCode}
                        />
                        <TouchableOpacity style={styles.smallBtn} onPress={handleVerify}>
                            <Text style={styles.smallBtnText}>확인</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>새 비밀번호</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="8~16자 영문, 숫자, 특수문자"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                        <Text style={styles.buttonText}>비밀번호 재설정</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default FindPasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContainer: {
        paddingBottom: 30,
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    form: {
        width: wp("85%"),
    },
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
    smallBtn: {
        borderWidth: 1,
        borderColor: "#555",
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    smallBtnText: {
        color: "black",
        fontWeight: "bold",
        fontSize: 13,
    },
    button: {
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 30,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
