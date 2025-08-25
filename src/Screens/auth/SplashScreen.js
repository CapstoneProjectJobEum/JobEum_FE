import React from "react";
import { StyleSheet, Text, View, } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import COLORS from "../../constants/colors";

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>JOBEUM</Text>
            <Text style={styles.subtitle}>당신에게 맞는 최고의 채용을 찾아드립니다.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.THEMECOLOR,
    },
    title: {
        color: 'white',
        fontSize: wp('13%'),
        fontWeight: "bold",
        marginBottom: hp('1.5%'),
    },
    subtitle: {
        color: 'white',
        fontSize: wp('4%'),
        textAlign: 'center',
        paddingHorizontal: wp('10%'),
    },
});
