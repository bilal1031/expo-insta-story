# expo-insta-story

This library is an extension of <b>react-native-insta-story</b>. It includes showing images and videos on the insta-stories component using expo-av which is currently not supported by <b>react-native-insta-story<b>

<p align="center">
<img src="./images/example.gif" height="500" />
</p>

## Install

#### 1. Step

```javascript
npm install expo-insta-story --save
```

or

```javascript
yarn add expo-insta-story
```

#### 2. Step

## Import

```javascript
import ExpoInstaStory from 'expo-insta-story';
```

## Props

| Name                       | Description                                         | Type          | Default Value |
| :------------------------- | :-------------------------------------------------- | :------------ | :-----------: |
| data                       | Array of IUserStory. You can check from interfaces. | object        |               |
| unPressedBorderColor       | Unpressed border color of profile circle            | color         |      red      |
| pressedBorderColor         | Pressed border color of profile circle              | color         |     grey      |
| unPressedAvatarTextColor   | Unpressed avatar text color                         | color         |      red      |
| pressedAvatarTextColor     | Pressed avatar text color                           | color         |     grey      |
| onStorySeen                | Called each time story is seen                      | function      |     null      |
| onClose                    | Todo when close                                     | function      |     null      |
| onStart                    | Todo when start                                     | function      |     null      |
| duration                   | default per story duration seconds                  | number        |      10       |
| swipeText                  | Text of swipe component                             | string        |   Swipe Up    |
| renderSwipeUpComponent     | Render a custom swipe up component                  | function      |               |
| renderCloseComponent       | Render a custom close button                        | function      |               |
| renderTextComponent        | Render custom avatar text component                 | function      |               |
| avatarSize                 | Size of avatar circle                               | number        |      60       |
| showAvatarText             | For show or hide avatar text.                       | bool          |     true      |
| avatarTextStyle            | For avatar text style                               | TextStyle     |               |
| avatarImageStyle           | For avatar image style                              | ImageStyle    |               |
| avatarWrapperStyle         | For individual avatar wrapper style                 | ViewStyle     |               |
| avatarFlatListProps        | Horizontal avatar flat list props                   | FlatListProps |               |
| loadedAnimationBarStyle    | For loaded animation bar style                      | ViewStyle     |               |
| unloadedAnimationBarStyle  | For unloaded animation bar style                    | ViewStyle     |               |
| animationBarContainerStyle | For animation bar container style                   | ViewStyle     |               |
| storyUserContainerStyle    | For story item user container style                 | ViewStyle     |               |
| storyImageStyle            | For story image style                               | ImageStyle    |               |
| storyAvatarImageStyle      | For story avatar image style                        | ImageStyle    |               |
| storyContainerStyle        | For story container style                           | ViewStyle     |               |
| storyVideoStyle            | For story video container style                     | ViewStyle     |               |

## Usage

### Basic

```javascript
import ExpoInstaStory from 'expo-insta-story';

const data = [
  {
    id: 1,
    avatar_image:
      'https://pbs.twimg.com/profile_images/1222140802475773952/61OmyINj.jpg',
    user_name: 'Muhammad Bilal',
    stories: [
      {
        story_id: 1,
        story_image:
          'https://image.freepik.com/free-vector/universe-mobile-wallpaper-with-planets_79603-600.jpg',
        swipeText: 'Custom swipe text for this story',
        onPress: () => console.log('story 1 swiped'),
        duration: 10, //This tells the duration of each screen
      },
      {
        story_id: 2,
        story_image:
          'https://image.freepik.com/free-vector/mobile-wallpaper-with-fluid-shapes_79603-601.jpg',
        duration: 10,
      },
    ],
  },
  {
    id: 2,
    avatar_image:
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80',
    user_name: 'Test User',
    stories: [
      {
        story_id: 1,
        story_image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjORKvjcbMRGYPR3QIs3MofoWkD4wHzRd_eg&usqp=CAU',
        swipeText: 'Custom swipe text for this story',
        onPress: () => console.log('story 1 swiped'),
        duration: 10,
      },
      {
        story_id: 2,
        story_image: 'https://demo-link/123-123-123.mp4',
        swipeText: 'Custom swipe text for this story',
        onPress: () => console.log('story 2 swiped'),
        duration: 10,
        /* This indicates that this item is a video,
           when passing a video urlm this field must be added
        */
        isVideo: true,
      },
    ],
  },
];

<ExpoInstaStory data={data} duration={10} />;
```

### Custom components

The render component functions are all passed `item` as a prop which is the current [IUserStoryItem](./src/interfaces/index.ts#L15) being displayed.

`renderSwipeUpComponent` and `renderCloseComponent` are both passed the `onPress` prop which is a function that closes the current story item modal and calls the `IUserStoryItem.onPress` function. `onPress` is passed so you could add other buttons. This is useful when adding a button which has it's own `onPress` prop, eg. a share button, next to the close button.

`renderTextComponent` is passed the `profileName` of the current story's user.

```javascript
const data = [...sameDataAsBasicExampleAbove];

const [seenStories, setSeenStories] = useState(new Set());

const updateSeenStories = ({ story: { story_id } }) => {
  setSeenStories((prevSet) => {
    prevSet.add(storyId);
    return prevSet;
  });
};

const handleSeenStories = async (item) => {
  console.log(item);
  const storyIds = [];
  seenStories.forEach((storyId) => {
    if (storyId) storyIds.push(storyId);
  });
  if (storyIds.length > 0) {
    await fetch('myApi', {
      method: 'POST',
      body: JSON.stringify({ storyIds }),
    });
    seenStories.clear();
  }
};

<ExpoInstaStory
  data={data}
  duration={10}
  onStart={(item) => console.log(item)}
  onClose={handleSeenStories}
  onStorySeen={updateSeenStories}
  renderCloseComponent={({ item, onPress }) => (
    <View style={{ flexDirection: 'row' }}>
      <Button onPress={shareStory}>Share</Button>
      <Button onPress={onPress}>X</Button>
    </View>
  )}
  renderTextComponent={({ item, profileName }) => (
    <View>
      <Text>{profileName}</Text>
      <Text>{item.customProps?.yourCustomProp}</Text>
    </View>
  )}
  style={{ marginTop: 30 }}
/>;
```
