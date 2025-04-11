// components/RoleGuard.tsx
import { useContext } from 'react';
import { View, Text } from 'react-native';
import { AuthContext } from '../providers/AuthProvider';
import { getAllowedScreensByRole } from '../utils/roleScreens';

export default function RoleGuard({ children, screenName }) {
  const { session } = useContext(AuthContext);
  
  const allowedScreens = getAllowedScreensByRole(session?.role || '');
  
  if (!allowedScreens.includes(screenName)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>You don't have permission to access this page</Text>
      </View>
    );
  }

  return children;
}