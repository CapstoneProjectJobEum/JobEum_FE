import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SettingScreen() {
    const navigation = useNavigation();
    const [snsProvider, setSnsProvider] = useState('');
    const [userType, setUserType] = useState('');

    useEffect(() => {
        const loadUserInfo = async () => {
            const stored = await AsyncStorage.getItem("userInfo");
            const parsed = stored ? JSON.parse(stored) : {};
            setSnsProvider(parsed.snsProvider || '');
            setUserType(parsed.userType || '개인회원');
        };
        loadUserInfo();
    }, []);

    const handleAccountInfoPress = () => {
        if (userType === '기업회원') {
            navigation.navigate('AccountInfoCompany');
        } else {
            navigation.navigate('AccountInfoUser');
        }
    };

    return (
        <View style={styles.container}>
            <View>
                <TouchableOpacity onPress={handleAccountInfoPress} style={styles.topButton}>
                    <MaterialCommunityIcons name="account-edit-outline" size={24} color="black" style={{ marginRight: wp(3) }} />
                    <Text style={styles.buttonText}>계정 정보</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('NotificationSettingScreen')} style={styles.topButton}>
                    <FontAwesome5 name="bell" size={20} color="black" style={{ marginRight: wp(4) }} />
                    <Text style={styles.buttonText}>알림 설정</Text>
                </TouchableOpacity>
                {!snsProvider && (
                    <TouchableOpacity onPress={() => navigation.navigate('FindPasswordScreen')} style={styles.topButton}>
                        <MaterialIcons name="lock-outline" size={24} color="black" style={{ marginLeft: wp(-1), marginRight: wp(3), }} />
                        <Text style={styles.buttonText}>비밀번호 변경</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => navigation.navigate('LogoutScreen')} style={styles.topButton}>
                    <MaterialIcons name="logout" size={24} color="black" style={{ marginRight: wp(2) }} />
                    <Text style={styles.buttonText}>로그아웃</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.bottomContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('WithdrawScreen')} style={styles.bottomButton}>
                    <Text style={styles.buttonText}>탈퇴하기</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('CustomerServiceScreen')} style={styles.bottomButton}>
                    <Text style={styles.buttonText}>고객센터</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: hp(3),
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FA',
    },
    topButton: {
        width: '100%',
        height: hp(5),
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
    },
    bottomContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bottomButton: {
        width: '50%',
        height: hp(4),
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: wp(3.5),
        fontWeight: 'bold',
        color: 'black',
    },
});