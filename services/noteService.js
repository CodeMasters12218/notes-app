import * as FileSystem from 'expo-file-system';
import { ID, Query } from "react-native-appwrite";
import databaseService from "./databaseService";
import tagService from "./tagService";


// Appwrite database and collection id service for notes
const dbId = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const colId = process.env.EXPO_PUBLIC_APPWRITE_COL_NOTES_ID;
const bucketID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID;

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
            Query.isNull('deletedAt')
        ]);
        return response;
        } catch (error) {
            console.log('Error fetching notes:', error.message);
            return {data: [], error: error.message};
        }    
    }, 
    // Add notes   
    async addNote(user_id, text, tags = [], reminderAt = null, imageUri = null, audioUri = null) {
        if (!text && !imageUri && !audioUri) {
            return {error: "Note text cannot be empty"};
        }

        let imageUrl = null;
        let audioUrl = null;
        try {
            if (imageUri) {
                const fileId = await this.uploadImageToAppwrite(imageUri);
                if (fileId) {
                    imageUrl = await this.getImageUrl(fileId);
                }
            }

            if (audioUri) {
                const fileId = await this.uploadAudioToAppwrite(audioUri);
                if (fileId) {
                    audioUrl = await this.getAudioUrl(fileId); // debes implementarla igual que getImageUrl
                }
            }

            const data = {
                text: text,
                createdAt: new Date().toISOString(),
                user_id: user_id,
                tags: tags,
                reminderAt: reminderAt ? reminderAt.toISOString() : null,
                imageUrl: imageUrl,
                audioUrl: audioUrl,
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
        } catch (error) {
            console.error("Error creating note:", error);
            return {error: error.message};
        }
    },


    // Update note

    async updateNote(id, updates) {
        const response = await databaseService.updateDocument(dbId, colId, id, updates);
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
        
    },

    // Move to trash

    async moveToTrash(id) {
        const deletedAt = new Date().toISOString();
        const response = await databaseService.updateDocument(dbId, colId, id, { deletedAt });

        if (response?.error) {
            return { error: response.error };
        }

        return { data: response };
    },

    async getTrashedNotes(userId) {
        if (!userId) {
            return { data: [], error: 'User ID is missing' };
        }

        try {
            const response = await databaseService.listDocuments(dbId, colId, [
                Query.equal('user_id', userId),
                Query.greaterThan('deletedAt', '1970-01-01T00:00:00Z')
            ]);
            return response;
        } catch (error) {
            console.log('Error fetching trashed notes:', error.message);
            return { data: [], error: error.message };
        }
    },

    async restoreNote(id) {
        const response = await databaseService.updateDocument(dbId, colId, id, {deletedAt: null});

        if (response?.error) {
            return { error: response.error };
        }

        return { data: response};
    },

    // Empty trash

    async emptyTrash(userId) {
        if (!userId) {
            return { error: 'User ID is missing' };
        }

        try {
            // 1. Listar notas en papelera
            const response = await databaseService.listDocuments(dbId, colId, [
                Query.equal('user_id', userId),
                Query.greaterThan('deletedAt', '1970-01-01T00:00:00Z'),
            ]);

            if (response.error) {
                return { error: response.error };
            }

            const trashedNotes = response.data;

            // 2. Borrar cada nota permanentemente
            const deletePromises = trashedNotes.map(note =>
                databaseService.deleteDocument(dbId, colId, note.$id)
            );

            // Esperar a que todas las eliminaciones terminen
            const results = await Promise.all(deletePromises);

            // Verificar si hubo errores
            const errors = results.filter(r => r?.error);
            if (errors.length > 0) {
                return { error: 'Some notes could not be deleted' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error emptying trash:', error.message);
            return { error: error.message };
        }
    },

    uploadImageToAppwrite: async function(uri) {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const file = await databaseService.storage.createFile(bucketID, ID.unique(), blob);
            return file.$id;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    },

    getImageUrl: async function(fileId) {
        return databaseService.storage.getFileView(bucketID, fileId).href;
    },
    getAudioUrl: async function(fileId) {
        return databaseService.storage.getFileView(bucketID, fileId).href;
    },  
    uploadAudioToAppwrite: async function(uri) {
            try {
                const fileName = audioUri.split('/').pop();
                const mimeType = mime.getType(audioUri);

                const fileBuffer = await FileSystem.readAsStringAsync(audioUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const file = Buffer.from(fileBuffer, 'base64');

                const response = await storage.createFile(
                    bucketId,
                    ID.unique(),
                {
                    uri: audioUri,
                    name: fileName,
                    type: mimeType,
                }
            );

            return response.$id;
        } catch (err) {
            console.error("Error subiendo audio:", err);
            return null;
        }

    },    

};

export default noteService;