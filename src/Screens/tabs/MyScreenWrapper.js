import { createStackNavigator } from '@react-navigation/stack';
import MemberMyScreen from './MemberMyScreen';
import CompanyMyScreen from './CompanyMyScreen';
import AdminMyScreen from './AdminMyScreen'; // 추가: 관리자 화면 임포트

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
