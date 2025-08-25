import AddImageNoteModal from '@/components/AddImageNoteModal';
import AddNoteMenuModal from '@/components/AddNoteMenuModal';
import AddNoteModal from '@/components/AddNoteModal';
import AudioPlayer from '@/components/AudioPlayer';
import AudioRecorder from '@/components/AudioRecorder';
import ImageSourcePickerModal from '@/components/ImageSourcePickerModal';
import NoteList from '@/components/NoteList';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import noteService from '@/services/noteService';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const NoteScreen = () => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { theme } = useTheme();
    const { t } = useTranslation();
    
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
    const [reminderAt, setReminderAt] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [imagePickerMenuVisible, setImagePickerMenuVisible] = useState(false);
    const [imageNoteModalVisible, setImageNoteModalVisible] = useState(false);
    const [imageToAdd, setImageToAdd] = useState(null);
    const [audioUri, setAudioUri] = useState(null);
    const [drawingSvg, setDrawingSvg] = useState(null); 

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
            Alert.alert(t('error'), response.error);
        } else {
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

    const handleAddNote = async () => {
        if(newNote.trim() === '' && !drawingSvg) {
            Alert.alert(t('error'), t('noteCannotBeEmpty'));
            return;
        }

        const response = await noteService.addNote(
            user.$id,
            newNote,
            selectedTags,
            reminderAt,
            imageToAdd, 
            audioUri,
            drawingSvg
        );

        console.log("[NoteScreen] Response de addNote:", response);

        if (response.error) {
            Alert.alert(t('error'), response.error);
            return;
        }

        setNotes([...notes, response.data]);
        setNewNote('');
        setSelectedTags([]);
        setReminderAt(null);
        setDrawingSvg(null);
        setModalVisible(false);
        setAudioUri(null);
        setImageToAdd(null);
    };

    const deleteNote = async (id) => {
        Alert.alert(t('trashMove'), t('trashMoveText'), [
            {
                text: t('cancelButton'),
                style: 'cancel',
            },
            {
                text: t('moveButton'),
                style: 'destructive',
                onPress: async () => {
                    const response = await noteService.moveToTrash(id);
                    if (response.error) {
                        Alert.alert(t('error'), response.error);
                    } else {
                        setNotes(notes.filter((note) => note.$id !== id));
                    }
                }
            }
        ]);
    }    

    const editNote = async (id, newText, reminderAt = null) => {
        if(!newText.trim()) {
            Alert.alert(t('error'), t('noteCannotBeEmpty'));
            return;
        }
        const response = await noteService.updateNote(id, {text: newText, reminderAt, tasks: parseTasksFromText(newText)});

        if (response.error) {
            Alert.alert(t('error'), response.error);
            return;
        } else {
            setNotes((prevNotes) => prevNotes.map((note) => note.$id === id ?
                {...note, text: response.data.text, reminderAt: response.data.reminderAt} : note));
        }
    };

    const restoreNote = async (id) => {
        const response = await noteService.restoreNote(id);

        if (response.error) {
            Alert.alert(t('error'), response.error);
        } else {
            setNotes((prevNotes) => prevNotes.filter(note => note.$id !== id));
            Alert.alert(t('restored'), t('noteHasBeenRestored'));
        }
    };

    const filteredNotes = notes.filter(note => {
        const matchesText = note.text.toLowerCase().includes(searchText.toLowerCase());
        const matchesTags = filterTags.length === 0 || filterTags.every(tag => note.tags?.includes(tag));
        return matchesText && matchesTags;
    });

    const filteredSuggestions = allTags.filter(
        tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.includes(tag)
    );

    const pickImageFromLibrary = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('accessDenied'), t('galleryPermission'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            setImageToAdd(imageUri);
            setImageNoteModalVisible(true);
        }
    };

    const pickImageFromCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('accessDenied'), t('cameraPermission'));
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            setImageToAdd(imageUri);
            setImageNoteModalVisible(true);
        }
    };

    const saveImageNote = async (text, imageUri) => {
        const response = await noteService.addNote(user.$id, text, [], null, imageUri);

        if (response.error) {
            Alert.alert(t('error'), response.error);
            return;
        }

        setNotes([...notes, response.data]);
        setImageToAdd(null);
        setImageNoteModalVisible(false);
    };

    const openDrawScreen = () => {
        router.push("/drawscreen");
    };

    return (
        <View style={[styles.container, {backgroundColor: theme.background}]}>
            {loading ? (
                <ActivityIndicator size="large" color={theme.primary} /> 
            ) : (
                <>
                    {error && <Text style={[styles.errorText, {color: theme.error}]}>{error}</Text>}

                    <TextInput 
                        style={[styles.searchInput, { 
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: theme.border
                        }]}
                        placeholder={t('notesSearch')}
                        placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#666'}
                        value={searchText}
                        onChangeText={setSearchText}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={[styles.input, {
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: theme.border
                        }]}
                        placeholder={t('addTag')}
                        placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#666'}
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
                                        backgroundColor: isSelected ? theme.primary : theme.tagBackground,
                                    }}
                                >
                                    <Text style={{ color: isSelected ? 'white' : theme.text }}>#{tag}</Text>
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
                                    <Text style={{ padding: 8, backgroundColor: theme.tagBackground, color: theme.text }}>
                                        {tag}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                        {selectedTags.map((tag, index) => (
                            <View
                                key={index}
                                style={{
                                    backgroundColor: theme.tagBackground,
                                    borderRadius: 16,
                                    paddingHorizontal: 12,
                                    paddingVertical: 4,
                                    margin: 4,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{color: theme.text}}>#{tag}</Text>
                                <TouchableOpacity
                                    onPress={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                                    style={{ marginLeft: 8 }}
                                >
                                    <Text style={{ color: theme.error }}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    {notes.length === 0 ? (
                        <Text style={[styles.noNotesText, {color: theme.text}]}>{t('noNotes')}</Text>
                    ) : filteredNotes.length === 0 && (searchText !== '' || filterTags.length > 0) ? (
                        <Text style={[styles.noNotesText, {color: theme.text}]}>{t('noMatchingNotes')}</Text>
                    ) : (
                        <NoteList notes={filteredNotes} onDelete={deleteNote} onEdit={editNote} />
                    )}
                </>
            )}
    
            <View style={{ position: 'absolute', bottom: 80, right: 20, left: 20 }}>
                <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: theme.secondary }]} 
                    onPress={() => router.push('/trash')}
                >
                    <Text style={[styles.addButtonText, {color: theme.buttonText}]}>{t('goToTrash')}</Text>
                </TouchableOpacity>
            </View>

            <View style={{ position: 'absolute', bottom: 140, right: 20, left: 20 }}>
                <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: theme.secondary }]} 
                    onPress={() => router.push('/profile')}
                >
                    <Text style={[styles.addButtonText, {color: theme.buttonText}]}>{t('goToProfile')}</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.addButton, {backgroundColor: theme.primary}]} onPress={() => setMenuVisible(true)}>
                <Text style={[styles.addButtonText, {color: theme.buttonText}]}>+ {t('addNote')}</Text>
            </TouchableOpacity>

            <AddNoteModal 
                modalVisible={modalVisible} 
                setModalVisible={setModalVisible}
                newNote={newNote}
                setNewNote={setNewNote}
                addNote={handleAddNote}
                user={user}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                reminderAt={reminderAt}
                setReminderAt={setReminderAt}
                drawingSvg={drawingSvg}
            />   

            <AddNoteMenuModal 
                visible={menuVisible} 
                onClose={() => setMenuVisible(false)} 
                onAddText={() => setModalVisible(true)}  
                onAddImage={() => setImagePickerMenuVisible(true)}
                onAddDrawing={openDrawScreen}
            />

            <ImageSourcePickerModal
                visible={imagePickerMenuVisible}
                onClose={() => setImagePickerMenuVisible(false)}
                onPickCamera={pickImageFromCamera}
                onPickGallery={pickImageFromLibrary}
            />

            <AddImageNoteModal
                visible={imageNoteModalVisible}
                imageUri={imageToAdd}
                onCancel={() => {
                    setImageNoteModalVisible(false);
                    setImageToAdd(null);
                }}
                onSave={saveImageNote}
            />

            <AudioRecorder onRecordingComplete={setAudioUri} />
            {audioUri && <AudioPlayer uri={audioUri} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        left: 20,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 16,
    },
    noNotesText: {
        textAlign: 'center',
        fontSize: 18,
        marginTop: 15,
        fontWeight: 'bold',
    },
});

export default NoteScreen;