import * as FileSystem from 'expo-file-system';
import mime from 'mime'; // Asegúrate que tienes esto si usas mime.getType()
import { ID, Query } from "react-native-appwrite";
import databaseService from "./databaseService";
import tagService from "./tagService";
import { parseTasksFromText } from "./taskUtils";

// Appwrite database and collection id service for notes
const dbId = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const colId = process.env.EXPO_PUBLIC_APPWRITE_COL_NOTES_ID;
const bucketID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID;

// --------------------------------------------
// Definición de funciones independientes
// --------------------------------------------

async function getNotes(userId) {
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
}

async function addNote(user_id, text, tags = [], reminderAt = null, imageUri = null, audioUri = null, drawingSvg = null) {
    if (!text && !imageUri && !audioUri) {
        return {error: "Note text cannot be empty"};
    }

    let imageUrl = null;
    let audioUrl = null;
    try {
        
        if (imageUri) {
            const fileId = await uploadImageToAppwrite(imageUri);
            if (fileId) {
                imageUrl = await getImageUrl(fileId);
            }
        }


        if (audioUri) {
            const fileId = await uploadAudioToAppwrite(audioUri);
            if (fileId) {
                audioUrl = await getAudioUrl(fileId); 
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
            drawingSvg: drawingSvg ? JSON.stringify(drawingSvg) : null,
        }


        const response = await databaseService.createDocument(dbId, colId, data, ID.unique());

        if (response?.error) {
            return {error: response.error};
        }

        const tasks = parseTasksFromText(text);

        const existingTags = await tagService.getTags(user_id);
        const existingTagNames = existingTags.data.map(tag => tag.name);

        for (const tag of tags) {
            if (!existingTagNames.includes(tag)) {
                await tagService.addTag(user_id, tag);
            }
        }
        return {data: {...response, tasks}, error: null};
    } catch (error) {
        console.error("Error creating note:", error);
        return {data: null, error: error.message};
    }
}

async function updateNote(id, updates) {
    const response = await databaseService.updateDocument(dbId, colId, id, updates);
    if (response?.error) {
        return {error: response.error};
    }
    const tasks = updates.text ? parseTasksFromText(updates.text) : [];
    return {data: {...response, tasks}};
}

async function deleteNote(id) {
    const response = await databaseService.deleteDocument(dbId, colId, id);
    if (response?.error) {
        return {error: response.error};
    }
    return {success: true};
}

async function moveToTrash(id) {
    const deletedAt = new Date().toISOString();
    const response = await databaseService.updateDocument(dbId, colId, id, { deletedAt });
    if (response?.error) {
        return { error: response.error };
    }
    return { data: response };
}

async function getTrashedNotes(userId) {
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
}

async function restoreNote(id) {
    const response = await databaseService.updateDocument(dbId, colId, id, {deletedAt: null});
    if (response?.error) {
        return { error: response.error };
    }
    return { data: response};
}

async function emptyTrash(userId) {
    if (!userId) {
        return { error: 'User ID is missing' };
    }
    try {
        const response = await databaseService.listDocuments(dbId, colId, [
            Query.equal('user_id', userId),
            Query.greaterThan('deletedAt', '1970-01-01T00:00:00Z'),
        ]);
        if (response.error) {
            return { error: response.error };
        }
        const trashedNotes = response.data;
        const deletePromises = trashedNotes.map(note =>
            databaseService.deleteDocument(dbId, colId, note.$id)
        );
        const results = await Promise.all(deletePromises);
        const errors = results.filter(r => r?.error);
        if (errors.length > 0) {
            return { error: 'Some notes could not be deleted' };
        }
        return { success: true };
    } catch (error) {
        console.error('Error emptying trash:', error.message);
        return { error: error.message };
    }
}

async function uploadImageToAppwrite(uri) {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = await databaseService.storage.createFile(bucketID, ID.unique(), blob);
        return file.$id;
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
}

async function getImageUrl(fileId) {
    return databaseService.storage.getFileView(bucketID, fileId).href;
}

async function getAudioUrl(fileId) {
    return databaseService.storage.getFileView(bucketID, fileId).href;
}

async function uploadAudioToAppwrite(audioUri) {
    try {
        const fileName = audioUri.split('/').pop();
        const mimeType = mime.getType(audioUri);

        // Expo FileSystem read as Base64 string
        const fileBuffer = await FileSystem.readAsStringAsync(audioUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const blob = new Blob([Uint8Array.from(atob(fileBuffer), c => c.charCodeAt(0))], { type: mimeType });

        const file = await databaseService.storage.createFile(bucketID, ID.unique(), blob);

        return file.$id;
    } catch (err) {
        console.error("Error subiendo audio:", err);
        return null;
    }
}

// --------------------------------------------
// Protegemos addNote para detectar reasignaciones
// --------------------------------------------

const _originalAddNote = addNote;

const noteService = {
    get addNote() {
        return _originalAddNote;
    },
    set addNote(newValue) {
        console.warn(
            "[ALERTA] noteService.addNote ha sido reasignado!",
            "Nuevo valor:", newValue,
            "Stack:",
            new Error().stack
        );
    },

    getNotes,
    deleteNote,
    emptyTrash,
    getTrashedNotes,
    moveToTrash,
    restoreNote,
    updateNote,
    uploadImageToAppwrite,
    getImageUrl,
    getAudioUrl,
    uploadAudioToAppwrite,
};

export default noteService;
