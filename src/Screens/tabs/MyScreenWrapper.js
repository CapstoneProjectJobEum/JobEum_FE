import { createStackNavigator } from '@react-navigation/stack';
import AdminMyScreen from './AdminMyScreen';
import MemberMyScreen from './MemberMyScreen';
import CompanyMyScreen from './CompanyMyScreen';

const Stack = createStackNavigator();

export default function MyScreenWrapper({ userType, role }) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {role === 'ADMIN' ? (
                <Stack.Screen name="AdminMyScreen" component={AdminMyScreen} />
            ) : userType === '개인회원' ? (
                <Stack.Screen name="MemberMyScreen" component={MemberMyScreen} />
            ) : (
                <Stack.Screen name="CompanyMyScreen" component={CompanyMyScreen} />
            )}
        </Stack.Navigator>
    );
}
