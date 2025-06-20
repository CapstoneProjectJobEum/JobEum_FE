import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

import {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    GOOGLE_SCOPE
} from '@env';

const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=${GOOGLE_SCOPE}`;

export default function GoogleLoginScreen() {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleWebViewNavigationStateChange = async (navState) => {
        const { url } = navState;
        if (url.startsWith(GOOGLE_REDIRECT_URI) && url.includes('code=')) {
            const code = url.split('code=')[1].split('&')[0];
            try {
                setLoading(true);
                const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
                    code,
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: GOOGLE_CLIENT_SECRET,
                    redirect_uri: GOOGLE_REDIRECT_URI,
                    grant_type: 'authorization_code',
                });
                const accessToken = tokenRes.data.access_token;

                const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                setUserInfo(userRes.data);
            } catch (error) {
                console.error('구글 로그인 오류:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleLogout = () => {
        setUserInfo(null);
        navigation.replace('SignUpScreen'); // TODO: 리디렉션 스크린명 수정
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
                    source={{ uri: GOOGLE_AUTH_URL }}
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
