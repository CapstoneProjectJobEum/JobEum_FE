import React from 'react';
import { View, Platform } from 'react-native';

const NAVIGATION_BAR_HEIGHT = Platform.OS === 'android' ? 48 : 0;

export default function BottomSpacer({ height }) {
    return (
        <View style={{ height: height ?? NAVIGATION_BAR_HEIGHT }} />
    );
}
