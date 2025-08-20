import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

    const {theme} = useTheme();


    const handleAuth = async () => {
        console.log('🔵 handleAuth triggered');

        if (!email.trim() || !password.trim()) {
            setError('Email and password are required');
            console.warn('⚠️ Missing email or password');
            return;
        }
        if (isRegistering && password !== confirmPassword) {
            setError('Passwords do not match');
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
                Alert.alert("Recovery email sent", "Check your inbox to reset your password.");
                setIsResetting(false);
            }
            return;
        } else {
            console.log('🟡 Logging in user...');
            response = await login(email, password);
        }

        if (response?.error) {
            console.error('❌ Auth error:', response.error);
            Alert.alert('Error', response.error);
            return;
        }

        if (!isResetting) {
            console.log('✅ Auth successful, redirecting...');
            router.replace('/notes');
        }
    };

    
    return ( <View style={[styles.container, {backgroundColor: theme.background}]}>
        <Text style = {[styles.header, {color: theme.text}]}>{ isRegistering ? 'Sign Up' : isResetting ? 'Reset Password' : 'Login'}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
    <TextInput 
        style={styles.input}
        placeholder='Email'
        placeholderTextColor='#aaa'
        value={email}
        onChangeText={setEmail}
        autoCapitalize='none'
        keyboardType='email-address'
    />

    { !isResetting && (
        <TextInput 
            style={[styles.input, {
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: theme.text === '#FFFFFF' ? '#555' : '#ddd'
            }]}
            placeholder='Password'
            placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#666'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType='none'
        />
    )}


    { isRegistering && (
        <TextInput 
            style={[styles.input, {
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: theme.text === '#FFFFFF' ? '#555' : '#ddd'
            }]}
            placeholder='Confirm Password'
            placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#666'}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textContentType = 'none'
        />
    )}

    <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>
            { isRegistering ? 'Sign Up' : 'Login'}
        </Text>
    </TouchableOpacity>

    <TouchableOpacity onPress= { () => setIsRegistering(!isRegistering) }>
        <Text style={styles.switchText}>
            { isRegistering 
            ? 'Already have an account? Login' 
            : "Don't have an account? Sign Up"}
        </Text>
    </TouchableOpacity>
    { !isRegistering && !isResetting && (
        <TouchableOpacity onPress={() => {setIsResetting(true); setIsRegistering(false);}}>
            <Text style={[styles.switchText, {marginTop: 5}]}>
                Forgot password?
            </Text>
        </TouchableOpacity>
    )}

    { isResetting && (
        <TouchableOpacity onPress={() => setIsResetting(false)}>
            <Text style={[styles.switchText, {marginTop: 5}]}>
                Back to login
            </Text>
        </TouchableOpacity>
    )}
    </View>    
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '100%',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    switchText: {
        color: '#007bff',
        marginTop: 10,
        fontSize: 16,
    },
    error: {
        color: 'red',
        marginBottom: 10,
        fontSize: 10,
    },    
});

export default AuthScreen;