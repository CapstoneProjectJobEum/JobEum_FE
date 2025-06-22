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

const FindIdScreen = () => {
    const navigation = useNavigation();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [verifyCode, setVerifyCode] = useState("");

    const handleVerify = () => {
        Alert.alert("인증번호 확인 기능 준비중");
    };


    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name.trim()) {
            Alert.alert("입력 오류", "이름을 입력해 주세요.");
            return false;
        }

        if (!email.trim()) {
            Alert.alert("입력 오류", "이메일을 입력해 주세요.");
            return false;
        }

        if (!emailRegex.test(email)) {
            Alert.alert("입력 오류", "유효한 이메일 형식이 아닙니다.");
            return false;
        }

        return true;
    };

    const handleFindId = async () => {
        if (!validateForm()) return;

        try {
            const response = await fetch('http://192.168.0.19:4000/api/find-id', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert("아이디 찾기 성공", `회원님의 아이디는: ${data.username}`);
            } else {
                Alert.alert("실패", data.message || "등록된 아이디가 없습니다.");
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
                        <Text style={styles.label}>이름</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="실명을 입력해 주세요"
                            value={name}
                            onChangeText={setName}
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




                    <TouchableOpacity style={styles.button} onPress={handleFindId}>
                        <Text style={styles.buttonText}>아이디 찾기</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default FindIdScreen;

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
