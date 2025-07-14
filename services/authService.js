import { ID } from 'react-native-appwrite';
import { account } from './appwrite';

const authService = {
    // Register a new user
    async register(email, password) {
        console.log('📨 Attempting to register:', email);
        try {
            const response = await account.create(ID.unique(), email, password);
            console.log('✅ Registration successful:', response);
            return response;
        } catch (error) {
            console.error('❌ Registration failed:', error);
            return {
                error: error.message || 'Registration failed. Please try again',
            };
        }
    },

    // Login an existing user
    async login(email, password) {
        console.log('🔐 Attempting login for:', email);
        try {
            const session = await account.createEmailPasswordSession(email, password);
            console.log('✅ Login successful:', session);
            return session;
        } catch (error) {
            console.error('❌ Login failed:', error);
            return {
                error: error.message || 'Login failed. Please try again',
            };
        }
    },

    // Get the current user
    async getUser() {
        try {
            const user = await account.get();
            return user;
        } catch (error) {
            return null;
        }
    },
    //Logout the current user
    async logout() {
        try {
            await account.deleteSession('current');
        } catch (error) {
            return { error: error.message || 'Logout failed. Please try again' };
        }
    }
};    

export default authService;