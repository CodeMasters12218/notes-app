import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function AudioPlayer({ uri }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playPauseAudio = async () => {
    if (!sound) {
      const { sound: playbackObject } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      setSound(playbackObject);
      setIsPlaying(true);

      playbackObject.setOnPlaybackStatusUpdate((status) => {
        if (!status.isPlaying) {
          setIsPlaying(false);
          playbackObject.unloadAsync();
          setSound(null);
        }
      });
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  if (!uri) return null;

  return (
    <View style={styles.container}>
      <Button
        title={isPlaying ? 'Pause audio' : 'Play audio'}
        onPress={playPauseAudio}
      />
      <Text style={styles.text}>Audio ready to play</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    alignItems: 'center',
  },
  text: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
});
