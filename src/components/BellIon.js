import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotification } from '../context/NotificationContext';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { FontAwesome5 } from '@expo/vector-icons';

export default function BellIcon() {
    const navigation = useNavigation();
    const { hasNewNotification } = useNotification();

    return (
        <TouchableOpacity onPress={() => navigation.navigate('NotificationScreen')}>
            <View style={styles.iconWrapper}>
                <FontAwesome5 name="bell" size={wp('5.2%')} color="black" />
                {hasNewNotification && <View style={styles.redDot} />}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    iconWrapper: {
        position: 'relative'
    },
    redDot: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'red',
    },
});
