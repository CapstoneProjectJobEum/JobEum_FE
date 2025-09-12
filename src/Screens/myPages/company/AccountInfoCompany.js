import React, { useState, useEffect } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert, } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "@env";
import COLORS from "../../../constants/colors";

export default function AccountInfoCompany() {
    const navigation = useNavigation();

    const [userId, setUserId] = useState(null);
    const [form, setForm] = useState({
        company: "",
        bizNumber: "",
        manager: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const storedUserInfo = await AsyncStorage.getItem("userInfo");
                const storedToken = await AsyncStorage.getItem("accessToken");

                console.log("AsyncStorage 저장된 userInfo:", storedUserInfo);
                console.log("AsyncStorage 저장된 accessToken:", storedToken);

                if (storedUserInfo && storedToken) {
                    const parsedUser = JSON.parse(storedUserInfo);

                    // 기업회원인 경우
                    if (parsedUser.userType === "기업회원") {
                        setUserId(parsedUser.id);
                        fetchCompanyInfo(parsedUser.id, storedToken);
                    }
                } else {
                    console.log("userInfo 또는 token이 AsyncStorage에 없습니다.");
                }
            } catch (error) {
                console.error("유저 정보 불러오기 오류:", error);
            }
        };

        loadUserInfo();
    }, []);

    const fetchCompanyInfo = async (id, token) => {
        try {
            const res = await axios.get(`${BASE_URL}/api/account-info/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data) {
                const { company, biz_number, manager, email, phone } = res.data;
                setForm({
                    company: company || "",
                    bizNumber: biz_number || "",
                    manager: manager || "",
                    email: email || "",
                    phone: phone || "",
                });
            }
        } catch (error) {
            console.error("기업회원 정보 조회 오류:", error);
            Alert.alert("오류", "기업 정보 불러오는 중 문제가 발생했습니다.");
        }
    };

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const bizNumberRegex = /^\d{10}$/;
        const phoneRegex = /^\d{10,11}$/;

        if (!form.company.trim()) {
            Alert.alert("입력 오류", "기업명을 입력해 주세요.");
            return false;
        }

        if (!bizNumberRegex.test(form.bizNumber)) {
            Alert.alert("입력 오류", "사업자번호는 숫자 10자리로 입력해 주세요.");
            return false;
        }

        if (!form.manager.trim()) {
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

    const handleSave = async () => {
        if (!validateForm()) return;

        if (!userId) {
            Alert.alert("오류", "로그인 정보가 없습니다.");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("accessToken");

            const response = await axios.put(
                `${BASE_URL}/api/account-info/${userId}`,
                {
                    user_type: "기업회원",
                    company: form.company,
                    bizNumber: form.bizNumber,
                    manager: form.manager,
                    email: form.email,
                    phone: form.phone,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.success) {
                Alert.alert("저장 완료", "기업 정보가 성공적으로 수정되었습니다.");
                navigation.goBack();
            } else {
                Alert.alert("저장 실패", response.data.message || "알 수 없는 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error("기업 정보 수정 오류:", error);
            Alert.alert("저장 실패", error.response?.data?.message || "서버 오류가 발생했습니다.");
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                extraScrollHeight={5}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.formContainer}>
                        <View style={styles.inputRow}>
                            <Text style={styles.label}>기업명</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder="기업명을 입력해 주세요"
                                value={form.company}
                                onChangeText={(text) => handleChange("company", text)}
                            />
                        </View>

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

                        <View style={styles.inputRow}>
                            <Text style={styles.label}>담당자</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder="실명을 입력해 주세요"
                                value={form.manager}
                                onChangeText={(text) => handleChange("manager", text)}
                            />
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
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>수정하기</Text>
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
        marginTop: hp("5%"),
        paddingBottom: hp("3.7%"),
        alignItems: "center",
        paddingHorizontal: wp("5.3%"),
    },
    formContainer: {
        width: wp("90%"),
    },
    inputRow: {
        marginBottom: hp("2%"),
    },
    label: {
        fontSize: wp("4.2%"),
        fontWeight: "600",
        marginBottom: hp("0.8%"),
        color: "#333",
    },
    inputField: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        paddingHorizontal: wp("4%"),
        paddingVertical: hp("1.2%"),
        fontSize: wp("4%"),
        borderWidth: 1,
        borderColor: "#ccc",
        height: hp("5%"),
    },
    saveButton: {
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: hp("1.5%"),
        borderRadius: 8,
        alignItems: "center",
        marginTop: hp("3%"),
        marginBottom: hp("2%"),
    },
    saveButtonText: {
        color: "#fff",
        fontSize: wp("4.5%"),
        fontWeight: "bold",
    },
});
