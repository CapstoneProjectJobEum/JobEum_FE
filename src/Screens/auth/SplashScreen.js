import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React from 'react';

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>JobEum</Text>
            <ActivityIndicator size="large" color="#1d2950" style={{ marginTop: 30 }} />
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    title: {
        marginTop: 50,
        color: '#1d2950',
        fontSize: 50,
        fontWeight: 'bold',
    },
});
