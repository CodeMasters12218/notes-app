// app/profile/index.jsx
import { useAuth } from '@/contexts/AuthContext';
import { Alert, Button, View } from 'react-native';

export default function ProfileScreen() {
  const { deleteAccount } = useAuth();

  const handleDelete = async () => {
    Alert.alert(
      "Delete Account",
      "This will delete your account and all your notes. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, delete",
          style: "destructive",
          onPress: async () => {
            const res = await deleteAccount();
            if (res?.error) {
              Alert.alert("Error", res.error);
            } else {
              Alert.alert("Account Deleted", "Your account and notes have been deleted.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Delete Account" onPress={handleDelete} />
    </View>
  );
}
