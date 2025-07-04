import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const AddNoteModal = ({ 
    modalVisible, 
    setModalVisible,
    newNote,
    setNewNote,
    addNote 
}) => {
    return (        
    <Modal
        visible={modalVisible}
        animationType='slide'
        transparent
        onRequestClose={() => setModalVisible(false)}
    >
    
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add a New Note</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Enter note...'
                    placeholderTextColor='#aaa'
                    value={newNote}
                    onChangeText={setNewNote}
                />
                <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={addNote}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
    ); 
}; 

const styles = StyleSheet.create({
        modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
})

export default AddNoteModal;