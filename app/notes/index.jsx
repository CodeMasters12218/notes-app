import AddNoteModal from '@/components/AddNoteModal';
import NoteList from '@/components/NoteList';
import { useAuth } from '@/contexts/AuthContext';
import noteService from '@/services/noteService';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const NoteScreen = () => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    
    const [notes, setNotes] = useState([]);
    const [modalVisible, setModalVisible] = useState(false); 
    const [newNote, setNewNote] = useState('');  
    const [loading, setLoading] = useState(true);  
    const [error, setError] = useState(null);
    
    const [searchText, setSearchText] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    const [filterTags, setFilterTags] = useState([]);
    const [allTags, setAllTags] = useState([]);

    useEffect(() => { 
        if (!authLoading && !user) {
            router.replace('/auth');
        }
    }, [user, authLoading]);
        

    useEffect(() => { 
        if (user) {
            fetchNotes();
        }
    }, [user]);


    /*
    useEffect(() => {
        const fetchTags = async () => {
            const response = await tagService.getTags(user.$id);
            if (!response.error) setAllTags(response.data.map(tag => tag.name));
        };
        if (user) fetchTags();
    }, [modalVisible]);
    */

    useEffect(() => {
        const fetchTags = async () => {
        if (user) {
            const response = await tagService.getTags(user.$id);
            if (!response.error) setAllTags(response.data.map(tag => tag.name));
        }
    };
    fetchTags();
    }, [user]);


    const fetchNotes = async () => {
        setLoading(true);
        const response = await noteService.getNotes(user.$id);

        if(response.error) {
            setError(response.error);
            Alert.alert('Error', response.error);
        } else {
            // Garantizar que tags sea un array
            const notesWithTags = response.data.map(note => ({
                ...note,
                tags: Array.isArray(note.tags) ? note.tags : [],
                text: note.text || '',
                $id: note.$id || '',
            }));
            setNotes(notesWithTags);
            setError(null);
        }

        setLoading(false);
    }    


    
    // Add a new note
    const addNote = async () => {
        if(newNote.trim() === '') {
            return;

        }
        const response = await noteService.addNote(user.$id, newNote, selectedTags);

        if (response.error) {
            Alert.alert('Error', response.error);
            return;
        } else {
            setNotes([...notes, response.data]);
        }

        setNewNote('');
        setSelectedTags([]);
        setModalVisible(false);
    };

    // Delete a note

    const deleteNote = async (id) => {
        Alert.alert('Move to Trash', 'Are you sure do you want to move this note to the trash?', [
            {
            text: 'Cancel',
            style: 'cancel',
            },
            {
            text: 'Move',
            style: 'destructive',
            onPress: async () => {
                const response = await noteService.moveToTrash(id);
                if (response.error) {
                    Alert.alert('Error', response.error);
                } else {
                    setNotes(notes.filter((note) => note.$id !== id));
                }
            }
            
        }])
    }    

    // Edit a note

    const editNote = async (id, newText) => {
        if(!newText.trim()) {
            Alert.alert('Error', 'Note text cannot be empty');
            return;
        }
        const response = await noteService.updateNote(id, newText);

        if (response.error) {
            Alert.alert('Error', response.error);
            return;
        } else {
            setNotes((prevNotes) => prevNotes.map((note) => note.$id === id ?
        {...note, text: response.data.text} : note));
        }
    };

    const restoreNote = async (id) => {
        const response = await noteService.restoreNote(id);

        if (response.error) {
            Alert.alert('Error', response.error);
        } else {
            // Opcional: actualizar el estado para remover la nota restaurada de la papelera
            setNotes((prevNotes) => prevNotes.filter(note => note.$id !== id));
            Alert.alert('Restored', 'The note has been restored.');
        }
    };


    const filteredNotes = notes.filter(note => {
        const matchesText = note.text.toLowerCase().includes(searchText.toLowerCase());
        const matchesTags = filterTags.length === 0 || filterTags.every(tag => note.tags?.includes(tag));

        return matchesText && matchesTags;
    });

    const filteredSuggestions = allTags.filter(
    tag =>
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !selectedTags.includes(tag)
    );


    return (
        <View style={styles.container}>
            { loading ? (
                <ActivityIndicator size="large" color="#007bff" /> 
            ) : (
                <>
                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search notes..."
                        value={searchText}
                        onChangeText={setSearchText}
                        autoCorrect={false}
                        autoCapitalize="none"
                        clearButtonMode="while-editing"
                    />

                    <TextInput
                        placeholder="Add tag and press enter"
                        value={tagInput}
                        onChangeText={setTagInput}
                        onSubmitEditing={() => {
                            if (tagInput.trim() !== '' && !selectedTags.includes(tagInput.trim())) {
                                setSelectedTags([...selectedTags, tagInput.trim()]);
                            }
                        setTagInput('');
                        }}
                    />

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
                    {allTags.map(tag => {
                        const isSelected = filterTags.includes(tag);
                        return (
                            <TouchableOpacity
                                key={tag}
                                onPress={() => {
                                    if (isSelected) {
                                        setFilterTags(filterTags.filter(t => t !== tag));
                                    } else {
                                        setFilterTags([...filterTags, tag]);
                                    }
                                }}
                            style={{
                                paddingVertical: 6,
                                paddingHorizontal: 12,
                                margin: 4,
                                borderRadius: 16,
                                backgroundColor: isSelected ? '#007bff' : '#eee',
                            }}
                        >
        <Text style={{ color: isSelected ? 'white' : 'black' }}>#{tag}</Text>
      </TouchableOpacity>
    );
  })}
</View>


                    {filteredSuggestions.length > 0 && (
                        <View style={{ marginTop: 4 }}>
                            {filteredSuggestions.map((tag, index) => (
                             <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    setSelectedTags([...selectedTags, tag]);
                                    setTagInput('');
                                }}
                            >
                        <Text style={{ padding: 8, backgroundColor: '#f0f0f0' }}>{tag}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        )}

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                    {selectedTags.map((tag, index) => (
                    <View
                        key={index}
                    style={{
                        backgroundColor: '#eee',
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        margin: 4,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                    >
                    <Text>{tag}</Text>
                    <TouchableOpacity
                        onPress={() =>
                            setSelectedTags(selectedTags.filter((t) => t !== tag))
                        }
                        style={{ marginLeft: 8 }}
                    >
                    <Text style={{ color: 'red' }}>✕</Text>
                </TouchableOpacity>
            </View>
        ))}
    </View>


                    {notes.length === 0 ? (
                        <Text style={styles.noNotesText}>You have no notes</Text>
                    ) : filteredNotes.length === 0 && (searchText !== '' || filterTags.length > 0) ? (
                        <Text style={styles.noNotesText}>No matching notes found</Text>
                    ) : (
                        <NoteList notes={filteredNotes} onDelete={deleteNote} onEdit={editNote} />
                    )}
                </>
            )}

    <View style={{ position: 'absolute', bottom: 80, right: 20, left: 20 }}>
        <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: '#dc3545' }]} 
            onPress={() => router.push('/trash')}
        >
            <Text style={styles.addButtonText}>Go to Trash</Text>
        </TouchableOpacity>
    </View>

    <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Note</Text>
    </TouchableOpacity>



        { /* Modal for adding new note */ }
        <AddNoteModal 
            modalVisible={modalVisible} 
            setModalVisible={setModalVisible}
            newNote={newNote}
            setNewNote={setNewNote}
            addNote={addNote}
            user={user}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
        />    


    </View>);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        left: 20,
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 16,
    },
    noNotesText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#555',
        marginTop: 15,
        fontWeight: 'bold',
    },
})

export default NoteScreen;