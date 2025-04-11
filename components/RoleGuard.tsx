// components/RoleGuard.tsx
import { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { AuthContext } from '../providers/AuthProvider';
import { hasAccessToScreen } from '../utils/roleScreens';

export default function RoleGuard({ children, screenName }) {
  const { session } = useContext(AuthContext);
  
  if (!hasAccessToScreen(session?.role, screenName)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, marginBottom: 20 }}>
          You don't have permission to access this page
        </Text>
        <Button 
          title="Go Back" 
          onPress={() => navigation.goBack()}
          color="#65A694"
        />
      </View>
    );
  }

  return children;
}