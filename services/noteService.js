import { ID, Query } from "react-native-appwrite";
import databaseService from "./databaseService";

// Appwrite database and collection id service for notes
const dbId = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const colId = process.env.EXPO_PUBLIC_APPWRITE_COL_NOTES_ID;

const noteService = {
    // Get Notes
    async getNotes(userId) {

        if(!userId) {
            console.error('Error; Missing userId in getNotes()');
            return {data: [], error: 'User ID is missing'};
        }    

        try {
            const response = await databaseService.listDocuments(dbId, colId, [
            Query.equal('user_id', userId),
        ]);
        return response;
        } catch (error) {
            console.log('Error fetching notes:', error.message);
            return {data: [], error: error.message};
        }    
    }, 
    // Add notes   
    async addNote(user_id, text, tags = []) {
        if (!text) {
            return {error: "Note text cannot be empty"};
        }

        const data = {
            text: text,
            createdAt: new Date().toISOString(),
            user_id: user_id,
            tags: tags,
        }
        const response = await databaseService.createDocument(dbId, colId, data, ID.unique());

        if (response?.error) {
            return {error: response.error};
        }

        const existingTags = await tagService.getTags(user_id);
        const existingTagNames = existingTags.data.map(tag => tag.name);

        for (const tag of tags) {
            if (!existingTagNames.includes(tag)) {
                await tagService.addTag(user_id, tag);
            }
        }

        return {data: response};
    },


    // Update note

    async updateNote(id, text) {
        const response = await databaseService.updateDocument(dbId, colId, id, {text});
        if (response?.error) {
            return {error: response.error};
        }

        return {data: response};
    },

    // Delete note
    async deleteNote(id) {
        const response = await databaseService.deleteDocument(dbId, colId, id);
        
        if (response?.error) {
            return {error: response.error};
        }

        return {success: true};
        
    }
};

export default noteService;