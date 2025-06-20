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

    // 인증번호 확인 API 호출 예시
    const handleVerify = async () => {
        if (!username || !email || !verifyCode) {
            Alert.alert("입력 오류", "아이디, 이메일, 인증번호를 모두 입력해주세요.");
            return;
        }

        try {
            // const response = await fetch("http://10.106.2.70:4000/api/verify-code", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify({
            //         username,
            //         email,
            //         verifyCode,
            //     }),
            // });

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

    // 인증이 완료된 경우에만 비밀번호 재설정 화면으로 이동 가능
    const goToResetPassword = () => {
        if (!isVerified) {
            Alert.alert("인증 필요", "먼저 인증번호 확인을 완료해 주세요.");
            return;
        }
        navigation.navigate("ResetPasswordScreen", { username, email, password });
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

                    <TouchableOpacity style={styles.button} onPress={goToResetPassword}>
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
        paddingHorizontal: 14,
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
