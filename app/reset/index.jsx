import { useRouter, useSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { account } from '../../services/appwrite';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { userId, secret, expire } = useSearchParams();
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userId || !secret || !expire) {
      Alert.alert(t('error'), t('invalidResetLink'));
    }
  }, [userId, secret, expire]);

  const handleReset = async () => {
    if (password !== confirmPassword) {
      Alert.alert(t('error'), t('passwordnotMatch'));
      return;
    }
    if (!password) {
      Alert.alert(t('error'), t('validPasswordRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      await account.updateRecovery(userId, secret, password);
      Alert.alert(t('success'), t('passwordResetSuccess'));
      router.push('/auth');
    } catch (error) {
      Alert.alert(t('error'), error.message || t('passwordResetError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('resetPassword')}</Text>
      <TextInput
        placeholder={t('newPassword')}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        placeholder={t('confirmNewPassword')}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      <Button 
        title={isSubmitting ? t('loading') : t('reset')} 
        onPress={handleReset} 
        disabled={isSubmitting} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});