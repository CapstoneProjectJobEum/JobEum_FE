import React, { useState, useRef } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ScrollView, } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import { useNotification } from '../../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import COLORS from "../../constants/colors";
import IMAGES from '../../assets/images';

export default function LoginScreen() {
    const { initSocketAfterLogin } = useNotification();
    const navigation = useNavigation();
    const [selectedUserType, setSelectedUserType] = useState("개인회원");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const passwordRef = useRef(null);

    const handleLogin = async () => {
        if (!username || !password) {
            alert('아이디와 비밀번호를 모두 입력하세요.');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, userType: selectedUserType }),
            });

            const result = await response.json();

            if (response.ok) {
                const userInfo = {
                    id: result.id,
                    username: result.username,
                    userType: result.userType,
                    role: result.role,
                    token: result.token,
                };

                await AsyncStorage.setItem('accessToken', result.token);
                const storedToken = await AsyncStorage.getItem('accessToken');
                console.log('저장된 accessToken:', storedToken);

                await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
                const storedUserInfo = await AsyncStorage.getItem('userInfo');
                console.log('저장된 userInfo:', storedUserInfo);

                initSocketAfterLogin();

                navigation.reset({
                    index: 0,
                    routes: [{ name: 'RouteScreen', params: { userType: result.userType, role: result.role } }],
                });
            } else {
                alert(result.message || '아이디 또는 비밀번호를 확인하세요.');
            }
        } catch (error) {
            console.error('로그인 에러:', error);
            alert('서버 오류가 발생했습니다.');
        }
    };


    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                extraScrollHeight={5}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={{ alignItems: 'center', marginTop: hp('8%') }}>
                        <Text style={{
                            fontSize: wp('12%'),
                            fontWeight: 'bold',
                            color: COLORS.THEMECOLOR,
                        }}>
                            JOBEUM
                        </Text>
                    </View>

                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                selectedUserType === "개인회원" && styles.typeButtonSelected,
                            ]}
                            onPress={() => {
                                setSelectedUserType("개인회원");
                                setUsername("");
                                setPassword("");
                            }}
                            accessibilityLabel="개인회원 로그인 선택"
                        >
                            <Text
                                style={[
                                    styles.typeButtonText,
                                    selectedUserType === "개인회원" && styles.typeButtonTextSelected,
                                ]}
                            >
                                개인회원
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                selectedUserType === "기업회원" && styles.typeButtonSelected,
                            ]}
                            onPress={() => {
                                setSelectedUserType("기업회원");
                                setUsername("");
                                setPassword("");
                            }}
                            accessibilityLabel="기업회원 로그인 선택"
                        >
                            <Text
                                style={[
                                    styles.typeButtonText,
                                    selectedUserType === "기업회원" && styles.typeButtonTextSelected,
                                ]}
                            >
                                기업회원
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.loginContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="아이디"
                            value={username}
                            onChangeText={setUsername}
                            returnKeyType="next"
                            autoCapitalize="none"
                            accessibilityLabel="아이디 입력"
                            onSubmitEditing={() => passwordRef.current?.focus()}
                        />

                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={styles.inputWithIcon}
                                placeholder="비밀번호"
                                secureTextEntry={!passwordVisible}
                                value={password}
                                onChangeText={setPassword}
                                autoCapitalize="none"
                                returnKeyType="done"
                            />

                            {password.length > 0 && (
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setPasswordVisible(!passwordVisible)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={passwordVisible ? "eye" : "eye-off"}
                                        size={24}
                                        color="#888"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.loginbtn}
                            onPress={handleLogin}
                            accessibilityLabel={`${selectedUserType} 로그인 버튼`}
                        >
                            <Text style={styles.btnfont}>
                                {selectedUserType === "개인회원" ? "개인회원 로그인" : "기업회원 로그인"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.authLinksContainer}>
                        <TouchableOpacity onPress={() => navigation.navigate("FindIdScreen", { userType: selectedUserType })}>
                            <Text style={styles.authLinkText}>아이디 찾기</Text>
                        </TouchableOpacity>

                        <Text style={styles.separator}>|</Text>

                        <TouchableOpacity onPress={() => navigation.navigate("FindPasswordScreen", { userType: selectedUserType })}>
                            <Text style={styles.authLinkText}>비밀번호 찾기</Text>
                        </TouchableOpacity>

                        <Text style={styles.separator}>|</Text>

                        <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
                            <Text style={styles.authLinkText}>회원가입</Text>
                        </TouchableOpacity>
                    </View>



                    {selectedUserType === "개인회원" && (
                        <View style={styles.socialIconContainer}>
                            {[
                                { source: IMAGES.NAVER, screen: "NaverLoginScreen" },
                                { source: IMAGES.KAKAO, screen: "KakaoLoginScreen" }
                            ].map((icon, idx) => (
                                <TouchableOpacity
                                    key={icon.screen}
                                    style={[
                                        styles.socialImageButton,
                                        idx === 1 && { marginRight: 0 } // 마지막 아이콘은 margin 제거
                                    ]}
                                    onPress={() => navigation.navigate(icon.screen)}
                                >
                                    <Image
                                        source={icon.source}
                                        style={styles.socialIconImage}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

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
        paddingBottom: hp('3.7%'),
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.2%'),
    },
    typeSelector: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: hp('2.5%'),
        marginTop: hp('5%'),
    },
    typeButton: {
        paddingVertical: hp('1.2%'),
        paddingHorizontal: wp('15%'),
        borderBottomWidth: 2,
        borderBottomColor: "#ccc",
        backgroundColor: "#fff",
    },
    typeButtonSelected: {
        borderBottomColor: COLORS.THEMECOLOR,
    },
    typeButtonText: {
        fontSize: wp('4.3%'),
        color: "#555",
    },
    typeButtonTextSelected: {
        color: COLORS.THEMECOLOR,
        fontWeight: "600",
    },
    loginContainer: {
        flexDirection: "column",
        marginBottom: hp('3%'),
        justifyContent: "center",
        alignItems: "center",
    },
    input: {
        backgroundColor: "#F7F7F7",
        width: wp('85%'),
        height: hp('5.5%'),
        borderRadius: wp('2.1%'),
        paddingHorizontal: wp('4%'),
        marginBottom: hp('1.8%'),
        fontSize: wp('4.3%'),
        borderWidth: 1,
        borderColor: "#ddd",
    },
    passwordInputContainer: {
        width: wp('85%'),
        height: hp('5.5%'),
        position: "relative",
        marginBottom: hp('1.8%'),
    },
    inputWithIcon: {
        backgroundColor: "#F7F7F7",
        width: wp('85%'),
        height: hp('5.5%'),
        borderRadius: wp('2.1%'),
        paddingHorizontal: wp('4%'),
        paddingRight: wp('11%'),
        marginBottom: hp('1.8%'),
        fontSize: wp('4.3%'),
        borderWidth: 1,
        borderColor: "#ddd",
    },
    eyeIcon: {
        position: "absolute",
        right: wp('2%'),
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        minWidth: 40,
        minHeight: 40,
        padding: 8,
    },
    loginbtn: {
        backgroundColor: COLORS.THEMECOLOR,
        borderRadius: wp('2.1%'),
        paddingVertical: hp('1.5%'),
        alignItems: "center",
        width: wp('85%'),
    },
    btnfont: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: wp('4.3%'),
    },
    authLinksContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: hp('2.5%'),
    },
    authLinkText: {
        color: "black",
        fontSize: wp('3.7%'),
        paddingHorizontal: wp('1.6%'),
    },
    separator: {
        color: "#999",
        fontSize: wp('3.7%'),
    },
    socialIconContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: hp('3.7%'),
    },
    socialImageButton: {
        width: wp('8%'),
        height: wp('8%'),
        borderRadius: wp('6.6%'),
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: wp('2.6%'),
        marginRight: wp('8%'),
    },
    socialIconImage: {
        width: wp('10.6%'),
        height: wp('10.6%'),
    },
});