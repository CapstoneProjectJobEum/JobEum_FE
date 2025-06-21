import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, SafeAreaView, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI } from '@env';

const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&prompt=login`;

export default function KakaoLoginScreen() {
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleWebViewNavigationStateChange = async (navState) => {
        const { url } = navState;
        if (url.startsWith(KAKAO_REDIRECT_URI) && url.includes('code=')) {
            const code = url.split('code=')[1];
            try {
                setLoading(true);
                const tokenRes = await axios.post(
                    'https://kauth.kakao.com/oauth/token',
                    null,
                    {
                        params: {
                            grant_type: 'authorization_code',
                            client_id: KAKAO_CLIENT_ID,
                            redirect_uri: KAKAO_REDIRECT_URI,
                            code,
                        },
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    }
                );

                const accessToken = tokenRes.data.access_token;
                const userRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                await AsyncStorage.setItem('user', JSON.stringify(userRes.data));
                navigation.reset({ index: 0, routes: [{ name: 'RouteScreen' }] });
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
