import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function AudioPlayer({ uri }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { t } = useTranslation();

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
        title={isPlaying ? t('pauseAudio') : t('playAudio')}
        onPress={playPauseAudio}
      />
      <Text style={styles.text}>{t('audioReady')}</Text>
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