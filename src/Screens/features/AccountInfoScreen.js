import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function AccountInfoScreen() {
    const [user, setUser] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const loadUser = async () => {
            const stored = await AsyncStorage.getItem('user');
            if (stored) {
                setUser(JSON.parse(stored));
            }
        };
        loadUser();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('user');
        navigation.reset({
            index: 0,
            routes: [{ name: 'LoginScreen' }],
        });
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text>🔄 사용자 정보를 불러오는 중...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>✅ 로그인된 사용자 정보</Text>
            <Text style={styles.info}>{JSON.stringify(user, null, 2)}</Text>
            <Button title="로그아웃" onPress={handleLogout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    info: { fontFamily: 'Courier', fontSize: 14, marginBottom: 20 },
});
