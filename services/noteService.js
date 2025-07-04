import databaseService from "./databaseService";

// Appwrite database and collection id service for notes
const dbId = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const colId = process.env.EXPO_PUBLIC_APPWRITE_COL_NOTES_ID;

const noteService = {
    // Get Notes
    async getNotes() {
        const response = await databaseService.listDocuments(dbId, colId);
        if (response.error) {
            return {error: response.error};
        }

        return {data: response};
    },    
};

export default noteService;