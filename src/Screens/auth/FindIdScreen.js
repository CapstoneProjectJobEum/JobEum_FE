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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function FindIdScreen() {
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
        width: wp("85%"),
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
        fontWeight: "bold"
    },
});
