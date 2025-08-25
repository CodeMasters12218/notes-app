import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Alert, Button, View } from 'react-native';

export default function ProfileScreen() {
  const { deleteAccount } = useAuth();
  const { t } = useTranslation();

  const handleDelete = async () => {
    Alert.alert(
      t('deleteAccount'),
      t('deleteAccountConfirmation'),
      [
        { text: t('cancelButton'), style: "cancel" },
        {
          text: t('deleteButton'),
          style: "destructive",
          onPress: async () => {
            const res = await deleteAccount();
            if (res?.error) {
              Alert.alert(t('error'), res.error);
            } else {
              Alert.alert(t('accountDeleted'), t('accountDeletedMessage'));
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title={t('deleteAccount')} onPress={handleDelete} />
    </View>
  );
}