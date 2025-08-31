import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from '../../context/NotificationContext';

export default function LogoutScreen() {
    const navigation = useNavigation();
    const { resetNotificationState } = useNotification();

    useEffect(() => {
        const logout = async () => {
            try {
                // 1. Notification 상태 초기화
                resetNotificationState();

                // 2. 사용자 정보 삭제
                await AsyncStorage.removeItem('userInfo');
                await AsyncStorage.removeItem('accessToken'); // 토큰도 삭제

                // 3. 로그인 화면으로 리셋
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'LoginScreen' }],
                });
            } catch (error) {
                console.error('로그아웃 중 오류 발생:', error);
            }
        };

        logout();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
        </View>
    );
}
