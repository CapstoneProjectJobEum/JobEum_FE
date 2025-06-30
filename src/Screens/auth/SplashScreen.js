import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import COLORS from "../../constants/colors";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>JobEum</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    image: {
        width: wp('53.3%'),
        height: hp('24.6%'),
        resizeMode: "contain",
    },
    title: {
        marginTop: hp('6.1%'),
        color: COLORS.THEMECOLOR,
        fontSize: wp('13.3%'),
        fontWeight: "bold",
    },
});
