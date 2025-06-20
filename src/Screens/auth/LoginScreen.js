import React, { useState, useRef, useEffect } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    SafeAreaView,
    Image,
    ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import COLORS from "../../constants/colors";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import IMAGES from '../../assets/images';

const LoginScreen = () => {
    const navigation = useNavigation();
    const [userType, setUserType] = useState("회원");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const passwordRef = useRef(null);

    const handleLogin = async () => {
        if (!username || !password) {
            alert('아이디와 비밀번호를 모두 입력하세요.');
            return;
        }

        try {
            const response = await fetch('http://192.168.0.19:4000/api/login', { // 서버 주소는 실제 환경에 맞게 변경할것
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (response.ok) {
                console.log("로그인 성공:", result);
                // 예: 토큰 저장
                // await AsyncStorage.setItem('token', result.token);
                navigation.navigate('RouteScreen', { userType }); // ✅ 수정된 줄
            } else {
                alert(result.message || '아이디 또는 비밀번호를 확인하세요.');
            }
        } catch (error) {
            console.error('로그인 에러:', error);
            alert('서버 오류가 발생했습니다.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TouchableOpacity
                    style={styles.loginbtn}
                    onPress={() => navigation.navigate("RouteScreen")}
                >
                    <Text style={styles.btnfont}>
                        홈화면 이동 임시 버튼
                    </Text>
                </TouchableOpacity>
                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            userType === "회원" && styles.typeButtonSelected,
                        ]}
                        onPress={() => setUserType("회원")}
                        accessibilityLabel="회원 로그인 선택"
                    >
                        <Text
                            style={[
                                styles.typeButtonText,
                                userType === "회원" && styles.typeButtonTextSelected,
                            ]}
                        >
                            회원
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            userType === "기업" && styles.typeButtonSelected,
                        ]}
                        onPress={() => setUserType("기업")}
                        accessibilityLabel="기업 로그인 선택"
                    >
                        <Text
                            style={[
                                styles.typeButtonText,
                                userType === "기업" && styles.typeButtonTextSelected,
                            ]}
                        >
                            기업
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.loginContainer}>
                    {/* 아이디 입력창 */}
                    <TextInput
                        style={styles.input}
                        placeholder="아이디"
                        value={username}
                        onChangeText={setUsername}
                        returnKeyType="next"
                        autoCapitalize="none"
                        accessibilityLabel="아이디 입력"
                        onSubmitEditing={() => passwordRef.current.focus()}
                    />
                    {/* 비밀번호 입력창 (아이콘 공간 확보) */}
                    <View style={styles.passwordWrapper}>
                        <TextInput
                            ref={passwordRef}
                            style={[styles.input, { paddingRight: 45 }]}
                            placeholder="비밀번호"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!isPasswordVisible}
                            returnKeyType="done"
                            accessibilityLabel="비밀번호 입력"
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                        />
                        {/* 포커스 있을 때만 아이콘 보임 */}
                        {passwordFocused && (
                            <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                accessibilityLabel={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                            >
                                <Ionicons
                                    name={isPasswordVisible ? "eye" : "eye-off"}
                                    size={20}
                                    color="#ccc"
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* 로그인 버튼 */}
                    <TouchableOpacity
                        style={styles.loginbtn}
                        onPress={handleLogin}
                        accessibilityLabel={`${userType} 로그인 버튼`}
                    >
                        <Text style={styles.btnfont}>
                            {userType === "회원" ? "회원 로그인" : "기업 로그인"}
                        </Text>
                    </TouchableOpacity>


                </View>

                <View style={styles.authLinksContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate("FindIdScreen")}>
                        <Text style={styles.authLinkText}>아이디 찾기</Text>
                    </TouchableOpacity>

                    <Text style={styles.separator}>|</Text>

                    <TouchableOpacity onPress={() => navigation.navigate("FindPasswordScreen")}>
                        <Text style={styles.authLinkText}>비밀번호 찾기</Text>
                    </TouchableOpacity>

                    <Text style={styles.separator}>|</Text>

                    <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
                        <Text style={styles.authLinkText}>회원가입</Text>
                    </TouchableOpacity>
                </View>



                {/* 소셜 로그인 버튼 */}
                {userType === "회원" && (
                    <View style={styles.socialIconContainer}>
                        <TouchableOpacity
                            style={styles.socialImageButton}
                            onPress={() => navigation.navigate('NaverLoginScreen')}
                        >
                            <Image
                                source={IMAGES.NAVER}
                                style={styles.socialIconImage}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialImageButton}
                            onPress={() => navigation.navigate('KakaoLoginScreen')}
                        >
                            <Image
                                source={IMAGES.KAKAO}
                                style={styles.socialIconImage}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>

                        {/* <TouchableOpacity
                            style={styles.socialImageButton}
                            onPress={() => navigation.navigate('GoogleLoginScreen')}
                        >
                            <Image
                                source={IMAGES.GOOGLE}
                                style={styles.socialIconImage}
                                resizeMode="contain"
                            />
                        </TouchableOpacity> */}
                    </View>
                )}


            </ScrollView>
        </SafeAreaView>
    );
};

export default LoginScreen;

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
    typeSelector: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
        marginTop: 120,
    },
    typeButton: {
        paddingVertical: 10,
        paddingHorizontal: wp('18%'),
        borderBottomWidth: 2,
        borderColor: "#ccc",
        backgroundColor: "#fff",
    },
    typeButtonSelected: {
        borderBottomColor: COLORS.THEMECOLOR,
    },
    typeButtonText: {
        fontSize: 16,
        color: "#555",
    },
    typeButtonTextSelected: {
        color: COLORS.THEMECOLOR,
        fontWeight: "600",
    },
    loginContainer: {
        flexDirection: "column",
        marginBottom: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    input: {
        backgroundColor: "#F7F7F7",
        width: wp('85%'),
        height: 45,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#ddd",
    },

    passwordWrapper: {
        width: wp('85%'),
        height: 45,
        position: "relative",
        marginBottom: 15,
    },
    iconBtn: {
        position: "absolute",
        right: 15,
        transform: [{ translateY: -10 }],
        top: "50%",
    },

    loginbtn: {
        backgroundColor: COLORS.THEMECOLOR,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
        width: wp('85%'),
    },
    btnfont: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },


    authLinksContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    authLinkText: {
        color: "black",
        fontSize: 14,
        paddingHorizontal: 6,
    },
    separator: {
        color: "#999",
        fontSize: 14,
    },
    socialIconContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
        gap: 20,
    },
    socialImageButton: {
        width: 30,
        height: 30,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10,
    },
    socialIconImage: {
        width: 40,
        height: 40,
    },
});
