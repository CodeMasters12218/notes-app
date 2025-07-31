import { database } from "./appwrite";

const databaseService = {
    // List documents

    async listDocuments(dbId, colId, queries = []) {
        try {
            const response = await database.listDocuments(dbId, colId, queries);
            return { data: response.documents || [], error: null };
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
    },

    // Update document

    async updateDocument(dbId, colId, id, data) {
        try {
            return await database.updateDocument(dbId, colId, id, data);
        } catch (error) {
            console.error("Error updating document:", error.message);
            return {error: error.message}
        }
    },

    // Delete a document
    async deleteDocument(dbId, colId, docId) {
        try {
            await database.deleteDocument(dbId, colId, docId);
            return {success: true};
        } catch (error) {
            console.error("Error deleting document:", error.message);
            return {error: error.message}
        }
    },
    async createFile(bucketId, fileId, file) {
        try {
            return await storage.createFile(bucketId, fileId, file);
        } catch (error) {
            console.error("Error uploading file:", error.message);
            return { error: error.message };
        }
    },
        
    async getFileView(bucketId, fileId) {
        try {
            return storage.getFileView(bucketId, fileId);
        } catch (error) {
            console.error("Error getting file:", error.message);
            return { error: error.message };
        }
    },
};
export default databaseService;