import { ID } from 'react-native-appwrite';
import { account, functions } from './appwrite';
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const NOTES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COL_NOTES_ID;
const DELETE_USER_FUNCTION_ID = process.env.EXPO_PUBLIC_APPWRITE_FUNCTION_DELETE_USER_ID;


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
    },

    async resetPassword(email) {
        try {
            await account.createRecovery(email, "notesapp://reset");
            return { success: true };
        } catch (err) {
            return { error: err.message };
        }
    },

    async deleteAccountAndNotes(userId) {
        try {
            const execution = await functions.createExecution(
                DELETE_USER_FUNCTION_ID,
                JSON.stringify({
                    userId,
                    databaseId: DATABASE_ID,
                    collectionId: NOTES_COLLECTION_ID,
            })
        );

        console.log("📝 Function output:", execution);

        if (execution.status !== "completed") {
            throw new Error(execution.response || "Function failed");
        }

        return { success: true };
        } catch (err) {
            console.error("❌ Error in deleteAccountAndNotes:", err);
            return { error: err.message };
        }
    }
};    

export default authService;