import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

import {
    NAVER_CLIENT_ID,
    NAVER_CLIENT_SECRET,
    NAVER_REDIRECT_URI,
    NAVER_STATE,
} from '@env';

const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${NAVER_REDIRECT_URI}&state=${NAVER_STATE}`;

export default function NaverLoginScreen() {
    const [userInfo, setUserInfo] = useState(null);
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

                setUserInfo(userRes.data);
            } catch (error) {
                console.error('네이버 로그인 오류:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleLogout = () => {
        setUserInfo(null);
        navigation.replace('SignUpScreen'); // 필요 시 리디렉션 경로 수정
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" />
                    <Text>사용자 정보 불러오는 중...</Text>
                </View>
            ) : userInfo ? (
                <View style={styles.container}>
                    <Text style={styles.title}>✅ 로그인 완료</Text>
                    <Text style={styles.info}>{JSON.stringify(userInfo, null, 2)}</Text>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>로그아웃</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <WebView
                    source={{ uri: NAVER_AUTH_URL }}
                    onNavigationStateChange={handleWebViewNavigationStateChange}
                    startInLoadingState
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    info: { fontFamily: 'Courier', fontSize: 14 },
    logoutButton: {
        marginTop: 20,
        backgroundColor: '#FF5A5F',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
