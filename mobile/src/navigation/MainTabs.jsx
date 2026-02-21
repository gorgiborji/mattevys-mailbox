import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Archive, Inbox, PenLine } from 'lucide-react-native';
import ArchiveScreen from '../screens/ArchiveScreen';
import BoxScreen from '../screens/BoxScreen';
import WriteScreen from '../screens/WriteScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Write" component={WriteScreen} options={{ tabBarIcon: ({ color, size }) => <PenLine color={color} size={size} /> }} />
      <Tab.Screen name="The Box" component={BoxScreen} options={{ tabBarIcon: ({ color, size }) => <Inbox color={color} size={size} /> }} />
      <Tab.Screen name="Archive" component={ArchiveScreen} options={{ tabBarIcon: ({ color, size }) => <Archive color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}
