import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import ExpoInstaStory from 'expo-insta-story';

export default function App() {
  function createData() {
    const array = [];
    const userCount = 10;
    const userStoryCount = 15;

    for (let i = 1; i <= userCount; i++) {
      const storyArray = [];
      for (let k = 1; k <= userStoryCount; k++) {
        storyArray.push({
          story_id: i,
          story: 'https://picsum.photos/500/800?random=' + Math.random(),
          swipeText: 'Custom swipe text for this story',
          onPress: () => console.log(`story ${i} swiped`),
          duration: 5,
        });
      }

      storyArray.push({
        story_id: storyArray.length + 1,
        story:
          'https://res.cloudinary.com/dreamwalks/video/upload/v1684159993/moluscotv/3CEB7CBB-FD49-410B-A72F-9D7B0A8DD730_v7yqqp.mp4',
        swipeText: 'Custom swipe text for this story',
        onPress: () => console.log(`story ${i} swiped`),
        duration: 15,
        isVideo: true,
      });

      array.push({
        id: i,
        avatar_image: 'https://picsum.photos/200/300?random=' + Math.random(),
        user_name: 'Test User ' + i,
        stories: storyArray,
      });
    }
    return array;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ExpoInstaStory
        data={createData()}
        duration={10}
        customSwipeUpComponent={
          <View>
            <Text>Swipe</Text>
          </View>
        }
        style={{ marginTop: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
