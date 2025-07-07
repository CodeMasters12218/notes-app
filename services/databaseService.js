import { database } from "./appwrite";

const databaseService = {
    // List documents

    async listDocuments(dbId, colId) {
        try {
            const response = await database.listDocuments(dbId, colId);
            return response.documents || [];
        } catch (error) {
            console.error("Error listing documents:", error.message);
            return {error: error.message}
        }

    },
    // Create a document
    async createDocument(dbID, colId, data, id = null) {
        try {
            return await database.createDocument(dbID, colId, id || undefined, data);
        } catch (error) {
            console.error("Error creating document:", error.message);
            return {error: error.message}
        }
    }
};
export default databaseService;