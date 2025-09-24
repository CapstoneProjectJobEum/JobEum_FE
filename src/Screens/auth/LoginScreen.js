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
import AsyncStorage from '@react-native-async-storage/async-storage';

import IMAGES from '../../assets/images';
import { BASE_URL } from '@env';

export default function LoginScreen() {
    const navigation = useNavigation();
    const [selectedUserType, setSelectedUserType] = useState("개인회원");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const passwordRef = useRef(null);

    useEffect(() => {
        console.log(BASE_URL);
    }, []);

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
                    token: result.token,
                };

                await AsyncStorage.setItem('accessToken', result.token);
                await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
                console.log('저장된 토큰:', result.token);

                navigation.navigate('RouteScreen', { userType: result.userType });
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
                    {/* 비밀번호 입력창 */}
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

                    {/* 로그인 버튼 */}
                    <TouchableOpacity
                        style={styles.loginbtn}
                        onPress={handleLogin}
                        accessibilityLabel={`${selectedUserType} 로그인 버튼`}
                    >
                        <Text style={styles.btnfont}>
                            {selectedUserType === "개인회원" ? "개인회원 로그인" : "기업회원 로그인"}
                        </Text>
                    </TouchableOpacity>

                    {/* 임시 버튼(지울 예정)) */}
                    <TouchableOpacity
                        style={styles.loginbtn}
                        onPress={() => navigation.navigate('RouteScreen')}
                    >
                        <Text style={styles.btnfont}>
                            임시 이동 버튼
                        </Text>
                    </TouchableOpacity>


                </View>

                <View style={styles.authLinksContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate("FindIdScreen", { userType: selectedUserType })}>
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
                {selectedUserType === "개인회원" && (
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
                    </View>
                )}
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
        marginTop: hp('10%'),
    },
    typeButton: {
        paddingVertical: hp('1.2%'),
        paddingHorizontal: wp('15%'),
        borderBottomWidth: 2,
        borderColor: "#ccc",
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
        gap: wp('5.3%'),
    },
    socialImageButton: {
        width: wp('8%'),
        height: wp('8%'),
        borderRadius: wp('6.6%'),
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: wp('2.6%'),
    },
    socialIconImage: {
        width: wp('10.6%'),
        height: wp('10.6%'),
    },

});