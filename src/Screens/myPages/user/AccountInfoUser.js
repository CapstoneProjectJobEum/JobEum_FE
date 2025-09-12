import React, { useState, useEffect } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert, } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from '@env';
import COLORS from "../../../constants/colors";

export default function AccountInfoUser() {
    const navigation = useNavigation();

    const [form, setForm] = useState({
        name: "",
        birth: "",
        gender: "",
        email: "",
        phone: "",
    });

    const [userId, setUserId] = useState(null);
    const [userType, setUserType] = useState(null);
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const storedUserInfo = await AsyncStorage.getItem('userInfo');
                const token = await AsyncStorage.getItem('accessToken');
                console.log('AsyncStorage userInfo:', storedUserInfo);

                if (storedUserInfo && token) {
                    const parsedUser = JSON.parse(storedUserInfo);
                    setUserId(parsedUser.id);
                    setUserType(parsedUser.userType);

                    const res = await axios.get(
                        `${BASE_URL}/api/account-info/${parsedUser.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`, // 토큰 추가
                            },
                        }
                    );

                    console.log('API response:', res.data);

                    if (res.data) {
                        const { name, birth, gender, email, phone } = res.data;
                        setForm({ name, birth, gender, email, phone });
                    }
                } else {
                    console.log('userInfo 또는 token이 AsyncStorage에 없습니다.');
                }
            } catch (error) {
                console.error("초기 유저 정보 로딩 오류:", error);
                Alert.alert("오류", "계정 정보를 불러오는 중 문제가 발생했습니다.");
            }
        };

        fetchUserInfo();
    }, []);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const birthRegex = /^\d{8}$/;
        const phoneRegex = /^\d{10,11}$/;

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

        if (!phoneRegex.test(form.phone)) {
            Alert.alert("입력 오류", "휴대폰 번호는 숫자만 10~11자리 입력해 주세요.");
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        if (!userId || userType !== '개인회원') {
            Alert.alert('오류', '로그인 정보가 없거나 개인회원이 아닙니다.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('accessToken');
            const response = await axios.put(
                `${BASE_URL}/api/account-info/${userId}`,
                {
                    user_type: '개인회원',
                    name: form.name,
                    birth: form.birth,
                    gender: form.gender,
                    email: form.email,
                    phone: form.phone,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // 토큰 추가
                    },
                }
            );

            if (response.data.success) {
                Alert.alert("저장 완료", "계정 정보가 성공적으로 수정되었습니다.");
                navigation.goBack();
            } else {
                Alert.alert("수정 실패", response.data.message || "알 수 없는 오류");
            }
        } catch (error) {
            console.error("계정 수정 오류:", error);
            Alert.alert("수정 실패", error.response?.data?.message || "서버 오류가 발생했습니다.");
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
                                    style={[styles.genderBtn, { marginRight: wp('2%') }, form.gender === "남자" && styles.genderBtnSelected]}
                                    onPress={() => handleChange("gender", "남자")}
                                >
                                    <Text style={[styles.genderText, form.gender === "남자" && styles.genderTextSelected]}>
                                        남자
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.genderBtn, form.gender === "여자" && styles.genderBtnSelected]}
                                    onPress={() => handleChange("gender", "여자")}
                                >
                                    <Text style={[styles.genderText, form.gender === "여자" && styles.genderTextSelected]}>
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
        marginBottom: hp('2%'),
    },
    label: {
        fontSize: wp('4.2%'),
        fontWeight: '600',
        marginBottom: hp('0.8%'),
        color: '#333',
    },
    inputField: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.2%'),
        fontSize: wp('4%'),
        borderWidth: 1,
        borderColor: '#ccc',
        height: hp('5%'),
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
    saveButton: {
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: hp('1.5%'),
        borderRadius: 8,
        alignItems: 'center',
        marginTop: hp('3%'),
    },
    saveButtonText: {
        color: '#fff',
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
    },
});
