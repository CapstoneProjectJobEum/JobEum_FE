import React, { useState } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    NAVER_CLIENT_ID,
    NAVER_CLIENT_SECRET,
    NAVER_REDIRECT_URI,
    NAVER_STATE,
} from '@env';

const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${NAVER_REDIRECT_URI}&state=${NAVER_STATE}`;

export default function NaverLoginScreen() {
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleWebViewNavigationStateChange = async (navState) => {
        const { url } = navState;
        if (url.startsWith(NAVER_REDIRECT_URI) && url.includes('code=')) {
            const code = url.split('code=')[1].split('&')[0];
            try {
                setLoading(true);
                const tokenRes = await axios.post(
                    `https://nid.naver.com/oauth2.0/token`,
                    null,
                    {
                        params: {
                            grant_type: 'authorization_code',
                            client_id: NAVER_CLIENT_ID,
                            client_secret: NAVER_CLIENT_SECRET,
                            code,
                            state: NAVER_STATE,
                        },
                    }
                );
                const accessToken = tokenRes.data.access_token;

                const userRes = await axios.get('https://openapi.naver.com/v1/nid/me', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                const userInfo = userRes.data.response;
                await AsyncStorage.setItem('user', JSON.stringify(userInfo));
                navigation.reset({ index: 0, routes: [{ name: 'RouteScreen' }] });
            } catch (error) {
                console.error('네이버 로그인 오류:', error);
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
