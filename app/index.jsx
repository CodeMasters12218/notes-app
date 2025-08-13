import PostItImage from '@/assets/images/post-it.png';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const HomeScreen = () => {
  const {user, loading} = useAuth();
  const { theme } = useTheme();
  const router = useRouter(); 
  
  useEffect(() => {  
    if(!loading && user) {
      router.replace('/notes');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size='large' color='#007bff'/>
      </View>
    )
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source= {PostItImage} style={styles.image} />
      <Text style = {[styles.title, {color: theme.text}]}>Welcome To Notes App</Text>
      <Text style = {[styles.subtitle, {color: theme.text}]}>
        Capture your thoughts anytime, anywhere
      </Text>

      <TouchableOpacity
        style={[styles.button, {backgroundColor: theme.buttonBackground}]}
        onPress= {() => router.push('/notes')}
      >
      <Text style = {[styles.buttonText, {color: theme.buttonText}]}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
});

export default HomeScreen;