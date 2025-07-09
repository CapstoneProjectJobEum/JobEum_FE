import { createStackNavigator } from '@react-navigation/stack';
import MemberMyScreen from './MemberMyScreen';
import CompanyMyScreen from './CompanyMyScreen';

const Stack = createStackNavigator();

export default function MyScreenWrapper({ userType }) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userType === '개인회원' ? (
                <Stack.Screen name="MemberMyScreen" component={MemberMyScreen} />
            ) : (
                <Stack.Screen name="CompanyMyScreen" component={CompanyMyScreen} />
            )}
        </Stack.Navigator>
    );
}
