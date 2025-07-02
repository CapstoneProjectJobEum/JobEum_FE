import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, SafeAreaView, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI } from '@env';

const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${encodeURIComponent(KAKAO_CLIENT_ID)}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&prompt=login`;

export default function KakaoLoginScreen() {
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleWebViewNavigationStateChange = async (navState) => {
        const { url } = navState;
        if (url.startsWith(KAKAO_REDIRECT_URI) && url.includes('code=')) {
            const code = new URL(url).searchParams.get('code'); // code 추출
            try {
                setLoading(true);

                // 백엔드에 code 전달해서 로그인 처리 요청
                const res = await axios.get(`http://localhost:4000/api/oauth/kakao/callback`, {
                    params: { code },
                });

                const { token, user } = res.data;

                const userInfo = {
                    username: user.username || user.name || '',
                    userType: user.user_type || '',
                    snsProvider: user.sns_provider || null,  // 소셜 로그인 제공자(kakao, naver) 또는 null
                    snsId: user.sns_id || null,
                    token: token,
                };

                // userInfo 저장
                await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));

                await AsyncStorage.setItem('accessToken', token);

                console.log('저장된 토큰:', token);

                navigation.reset({ index: 0, routes: [{ name: 'RouteScreen', params: { userType: userInfo.userType } }] });

            } catch (error) {
                console.error('카카오 로그인 오류:', error);
            } finally {
                setLoading(false);
            }
        }
    };


    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <WebView
                source={{ uri: KAKAO_AUTH_URL }}
                onNavigationStateChange={handleWebViewNavigationStateChange}
                startInLoadingState
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
