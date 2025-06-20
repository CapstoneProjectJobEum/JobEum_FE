import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import IMAGES from '../../assets/images';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [userType, setUserType] = useState("회원");

  const handleNavigate = () => {
    if (userType === "회원") {
      navigation.navigate("SignUpPersonalScreen");
    } else {
      navigation.navigate("SignUpCompanyScreen");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              userType === "회원" && styles.typeButtonSelected,
            ]}
            onPress={() => setUserType("회원")}
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

        <View style={styles.formContainer}>
          <TouchableOpacity style={styles.signupBtn} onPress={handleNavigate}>
            <Text style={styles.signupText}>
              {userType === "회원" ? "개인회원 가입하기" : "기업회원 가입하기"}
            </Text>
          </TouchableOpacity>

          {userType === "회원" && (
            <View style={styles.socialLoginContainer}>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => navigation.navigate('NaverLoginScreen')}
              >
                <Text style={styles.socialButtonText}>네이버 계정으로 가입하기</Text>
                <View style={styles.leftIconWrapper}>
                  <Image source={IMAGES.NAVERSIGN} style={styles.naverIcon} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => navigation.navigate('KakaoLoginScreen')}
              >
                <Text style={styles.socialButtonText}>카카오 계정으로 가입하기</Text>
                <View style={styles.leftIconWrapper}>
                  <Image source={IMAGES.KAKAOSIGN} style={styles.kakaoIcon} />
                </View>
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={styles.socialButton}
                onPress={() => navigation.navigate('GoogleLoginScreen')}
              >
                <Text style={styles.socialButtonText}>Google 계정으로 가입하기</Text>
                <View style={styles.leftIconWrapper}>
                  <Image source={IMAGES.GOOGLESIGN} style={styles.googleIcon} />
                </View>
              </TouchableOpacity> */}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;

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
    marginTop: 10,
    marginBottom: 20,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: wp("17%"),
    borderBottomWidth: 2,
    borderColor: "#ccc",
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
  formContainer: {
    width: wp("90%"),
    alignItems: "center",
  },
  signupBtn: {
    backgroundColor: COLORS.THEMECOLOR,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    width: "100%",
  },
  signupText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  socialLoginContainer: {
    marginTop: 30,
    width: "100%",
    gap: 12,
  },
  socialButton: {
    justifyContent: "center",
    alignItems: "center",
    height: 44,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },

  socialButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },

  leftIconWrapper: {
    position: "absolute",
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 90,
  },

  googleIcon: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },
  naverIcon: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },
  kakaoIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },

});