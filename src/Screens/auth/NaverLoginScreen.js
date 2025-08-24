import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    BASE_URL,
    NAVER_CLIENT_ID,
    NAVER_CLIENT_SECRET,
    NAVER_REDIRECT_URI,
    NAVER_STATE,
} from '@env';

const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(NAVER_REDIRECT_URI)}&state=${NAVER_STATE}`;


export default function NaverLoginScreen() {
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleWebViewNavigationStateChange = async (navState) => {
        const { url } = navState;
        if (url.startsWith(NAVER_REDIRECT_URI) && url.includes('code=')) {
            const code = new URL(url).searchParams.get('code');  // code 추출
            const state = new URL(url).searchParams.get('state'); // state 추출 (필요 시)

            try {
                setLoading(true);

                // 백엔드에 code, state 전달해서 로그인 처리 요청
                const res = await axios.get(`${BASE_URL}/api/oauth/naver/callback`, {
                    params: { code, state },
                });

                const { token, user } = res.data;

                const userInfo = {
                    id: user.id || null,
                    username: user.username || user.name || '',
                    userType: user.user_type || '개인회원',
                    role: user.role || 'MEMBER',
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
                if (error.response) {
                    console.error('네이버 로그인 오류:', error.response.data);
                } else {
                    console.error('네이버 로그인 오류:', error.message);
                }
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
                source={{ uri: NAVER_AUTH_URL }}
                onNavigationStateChange={handleWebViewNavigationStateChange}
                startInLoadingState
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
