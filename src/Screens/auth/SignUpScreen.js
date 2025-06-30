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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import IMAGES from '../../assets/images';

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [userType, setUserType] = useState("개인회원");

  const handleNavigate = () => {
    if (userType === "개인회원") {
      navigation.navigate("SignUpPersonalScreen");
    } else {
      navigation.navigate("SignUpCompanyScreen");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              userType === "개인회원" && styles.typeButtonSelected,
            ]}
            onPress={() => setUserType("개인회원")}
          >
            <Text
              style={[
                styles.typeButtonText,
                userType === "개인회원" && styles.typeButtonTextSelected,
              ]}
            >
              개인회원
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              userType === "기업회원" && styles.typeButtonSelected,
            ]}
            onPress={() => setUserType("기업회원")}
          >
            <Text
              style={[
                styles.typeButtonText,
                userType === "기업회원" && styles.typeButtonTextSelected,
              ]}
            >
              기업회원
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <TouchableOpacity style={styles.signupBtn} onPress={handleNavigate}>
            <Text style={styles.signupText}>
              {userType === "개인회원" ? "개인회원 가입하기" : "기업회원 가입하기"}
            </Text>
          </TouchableOpacity>

          {userType === "개인회원" && (
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
            </View>
          )}
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
    paddingBottom: hp('3.7%'),
    alignItems: "center",
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: hp('10%'),
    marginBottom: hp('2.5%'),
  },
  typeButton: {
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp("15%"),
    borderBottomWidth: 2,
    borderColor: "#ccc",
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
  formContainer: {
    width: wp("90%"),
    alignItems: "center",
  },
  signupBtn: {
    backgroundColor: COLORS.THEMECOLOR,
    height: hp('5%'),
    borderRadius: wp('5.3%'),
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp('3.7%'),
    width: "100%",
  },
  signupText: {
    color: "#fff",
    fontSize: wp('4.3%'),
    fontWeight: "500",
  },
  socialLoginContainer: {
    marginTop: hp('3.7%'),
    width: "100%",
    gap: wp('3.2%'),
  },
  socialButton: {
    justifyContent: "center",
    alignItems: "center",
    height: hp('5%'),
    borderRadius: wp('5.3%'),
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  socialButtonText: {
    fontSize: wp('4%'),
    fontWeight: "500",
    color: "#000",
  },
  leftIconWrapper: {
    position: "absolute",
    left: wp('4.3%'),
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: wp('24%'),
  },
  googleIcon: {
    width: wp('6.9%'),
    height: wp('6.9%'),
    resizeMode: "contain",
  },
  naverIcon: {
    width: wp('6.9%'),
    height: wp('6.9%'),
    resizeMode: "contain",
  },
  kakaoIcon: {
    width: wp('4.8%'),
    height: wp('4.8%'),
    resizeMode: "contain",
  },
});