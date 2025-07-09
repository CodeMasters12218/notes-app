import { ID } from 'react-native-appwrite';
import { account } from './appwrite';

const authService = {
    // Register a new user
    async register(email, password) {
        try {
            const response = await account.create(ID.unique(), email, password);
            return response;
        } catch (error) {
            return { error: error.message || 'Registration failed. Please try again' };
        }
    },

    // Login an existing user
    async login(email, password) {
        try {
            const response = await account.createEmailPasswordSession(email, password);
            return response;
        } catch (error) {
            return { error: error.message || 'Login failed. Please check your credentials' };
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