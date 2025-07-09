import { StyleSheet, Text, View } from 'react-native';

const AuthScreen = () => {
    return ( <View style={styles.container}>
        <Text>Auth</Text>
    </View>    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 20,
        color: '#333',
    },
});

export default AuthScreen;