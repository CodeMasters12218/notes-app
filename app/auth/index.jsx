import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const AuthScreen = () => {
    const { login, register, resetPassword } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');   
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [error, setError] = useState(false);
    const { theme } = useTheme();
    const { t } = useTranslation();

    const handleAuth = async () => {
        console.log('🔵 handleAuth triggered');

        if (!email.trim() || !password.trim()) {
            setError(t('emailPasswordRequired'));
            console.warn('⚠️ Missing email or password');
            return;
        }
        if (isRegistering && password !== confirmPassword) {
            setError(t('passwordnotMatch'));
            console.warn('⚠️ Passwords do not match');
            return;
        }

        let response;

        if (isRegistering) {
            console.log('🟢 Registering user...');
            response = await register(email, password);
        } else if (isResetting) {
            console.log('🟣 Resetting password...');
            response = await resetPassword(email);
            if (!response?.error) {
                Alert.alert(t('recoveryEmailSent'), t('checkInbox'));
                setIsResetting(false);
            }
            return;
        } else {
            console.log('🟡 Logging in user...');
            response = await login(email, password);
        }

        if (response?.error) {
            console.error('❌ Auth error:', response.error);
            Alert.alert(t('error'), response.error);
            return;
        }

        if (!isResetting) {
            console.log('✅ Auth successful, redirecting...');
            router.replace('/notes');
        }
    };

    return ( 
        <View style={[styles.container, {backgroundColor: theme.background}]}>
            <Text style={[styles.header, {color: theme.text}]}>
                {isRegistering ? t('signUp') : isResetting ? t('resetPassword') : t('login')}
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            
            <TextInput 
                style={[styles.input, {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.text === '#FFFFFF' ? '#555' : '#ddd'
                }]}
                placeholder={t('email')}
                placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#666'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize='none'
                keyboardType='email-address'
            />

            {!isResetting && (
                <TextInput 
                    style={[styles.input, {
                        backgroundColor: theme.inputBackground,
                        color: theme.text,
                        borderColor: theme.text === '#FFFFFF' ? '#555' : '#ddd'
                    }]}
                    placeholder={t('password')}
                    placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#666'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    textContentType='none'
                />
            )}

            {isRegistering && (
                <TextInput 
                    style={[styles.input, {
                        backgroundColor: theme.inputBackground,
                        color: theme.text,
                        borderColor: theme.text === '#FFFFFF' ? '#555' : '#ddd'
                    }]}
                    placeholder={t('confirmPassword')}
                    placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#666'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    textContentType='none'
                />
            )}

            <TouchableOpacity style={[styles.button, {backgroundColor: theme.buttonBackground}]} onPress={handleAuth}>
                <Text style={[styles.buttonText, {color: theme.buttonText}]}>
                    {isRegistering ? t('signUp') : t('login')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
                <Text style={[styles.switchText, {color: theme.primary}]}>
                    {isRegistering ? t('alreadyAccount') : t('noAccount')}
                </Text>
            </TouchableOpacity>
            
            {!isRegistering && !isResetting && (
                <TouchableOpacity onPress={() => {setIsResetting(true); setIsRegistering(false);}}>
                    <Text style={[styles.switchText, {marginTop: 5, color: theme.primary}]}>
                        {t('passwordForgot')}
                    </Text>
                </TouchableOpacity>
            )}

            {isResetting && (
                <TouchableOpacity onPress={() => setIsResetting(false)}>
                    <Text style={[styles.switchText, {marginTop: 5, color: theme.primary}]}>
                        {t('loginBack')}
                    </Text>
                </TouchableOpacity>
            )}
        </View>    
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    button: {
        paddingVertical: 12,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    switchText: {
        marginTop: 10,
        fontSize: 16,
    },
    error: {
        marginBottom: 10,
        fontSize: 10,
    },    
});

export default AuthScreen;