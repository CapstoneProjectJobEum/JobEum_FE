import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function LogoutScreen() {
    const navigation = useNavigation();

    useEffect(() => {
        const logout = async () => {
            try {
                await AsyncStorage.removeItem('userInfo');
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
