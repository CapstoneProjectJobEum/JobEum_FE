import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import IMAGES from '../../assets/images';

export default function SettingScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* 상단: 4행 1열 */}
            <View style={styles.topContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('FreeBoardDetailPage')} style={styles.topButton}>
                    <Image source={IMAGES.PERSONEDIT} style={styles.icon} />
                    <Text style={styles.buttonText}>계정 정보</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('FreeBoardDetailPage')} style={styles.topButton}>
                    <Image source={IMAGES.LOCK} style={styles.icon} />
                    <Text style={styles.buttonText}>비밀번호 변경</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('FreeBoardDetailPage')} style={styles.topButton}>
                    <Image source={IMAGES.NOTIFICATION} style={styles.icon} />
                    <Text style={styles.buttonText}>알림 설정</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('FreeBoardDetailPage')} style={styles.topButton}>
                    <Image source={IMAGES.LOGOUT} style={styles.icon} />
                    <Text style={styles.buttonText}>로그인 / 로그아웃</Text>
                </TouchableOpacity>
            </View>

            {/* 하단: 1행 2열 */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('FreeBoardDetailPage')} style={styles.bottomButton}>
                    <Text style={styles.buttonText}>탈퇴하기</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('FreeBoardDetailPage')} style={styles.bottomButton}>
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
    icon: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
        marginRight: '12',
    },
    topContainer: {
        gap: hp(0),
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
        gap: wp(0),
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
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black',
    },
});
