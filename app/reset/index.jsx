import { useRouter, useSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { account } from '../../services/appwrite';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { userId, secret, expire } = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userId || !secret || !expire) {
      Alert.alert('Error', 'The link to reset your password is invalid or has expired');
    }
  }, [userId, secret, expire]);

  const handleReset = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter a valid password');
      return;
    }

    setIsSubmitting(true);

    try {
      await account.updateRecovery(
        userId,
        secret,
        password,
      );
      Alert.alert('Success', 'Password has been reset successfully');
      router.push('/auth');  // <-- Aquí rediriges a la pantalla login
    } catch (error) {
      Alert.alert('Error', error.message || 'Password could not be reset. Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <TextInput
        placeholder="New password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        placeholder="Confirm new password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      <Button title={isSubmitting ? 'Loading...' : 'Reset'} onPress={handleReset} disabled={isSubmitting} />
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
