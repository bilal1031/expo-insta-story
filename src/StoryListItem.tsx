import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator,
  View,
  Platform,
  SafeAreaView,
} from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import { useVideoPlayer, VideoView } from 'expo-video';

import { usePrevious, isNullOrWhitespace } from './helpers';
import {
  IUserStoryItem,
  NextOrPrevious,
  StoryListItemProps,
} from './interfaces';

const { width, height } = Dimensions.get('window');

export const StoryListItem = ({
  index,
  userId,
  profileImage,
  profileName,
  duration = 10,
  onFinish,
  onClosePress,
  stories,
  currentPage,
  onStorySeen,
  renderCloseComponent,
  renderSwipeUpComponent,
  renderTextComponent,
  loadedAnimationBarStyle,
  unloadedAnimationBarStyle,
  animationBarContainerStyle,
  storyUserContainerStyle,
  storyImageStyle,
  storyAvatarImageStyle,
  storyContainerStyle,
  storyVideoStyle,
  initialStoryIndex = 0,
  ...props
}: StoryListItemProps & { initialStoryIndex?: number }) => {
  const [load, setLoad] = useState<boolean>(true);
  const [pressed, setPressed] = useState<boolean>(false);
  const [content, setContent] = useState<IUserStoryItem[]>(
    stories.map((x) => ({
      ...x,
      finish: 0,
    })),
  );
  const [currentContent, setCurrentContent] = useState<IUserStoryItem | null>(
    null,
  );
  const [current, setCurrent] = useState(initialStoryIndex);

  const progress = useRef(new Animated.Value(0)).current;
  const prevCurrentPage = usePrevious(currentPage);

  const videoSource = content[current]?.isVideo
    ? content[current].story ?? null
    : null;

  const player = useVideoPlayer(videoSource, (player) => {
    if (videoSource) {
      player.loop = false;
      player.play();
    }
  });

  // Set mute state on the player instance
  useEffect(() => {
    if (player) {
      player.muted = currentPage !== index;
    }
  }, [player, currentPage, index]);

  useEffect(() => {
    let isPrevious = !!prevCurrentPage && prevCurrentPage > currentPage;
    if (isPrevious) {
      setCurrent(content.length - 1);
    } else {
      setCurrent(initialStoryIndex);
    }

    let data = [...content];
    data.map((x, i) => {
      if (isPrevious) {
        x.finish = 1;
        if (i == content.length - 1) {
          x.finish = 0;
        }
      } else {
        // Fill previous bars if initialStoryIndex > 0
        x.finish = i < initialStoryIndex ? 1 : 0;
      }
    });
    setContent(data);
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, initialStoryIndex]);

  const prevCurrent = usePrevious(current);

  useEffect(() => {
    if (!isNullOrWhitespace(prevCurrent)) {
      if (prevCurrent) {
        if (
          current > prevCurrent &&
          content[current - 1].story == content[current].story
        ) {
          start();
        } else if (
          current < prevCurrent &&
          content[current + 1].story == content[current].story
        ) {
          start();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // For video progress tracking
  useEffect(() => {
    if (content[current]?.isVideo && player) {
      const interval = setInterval(() => {
        if (player.duration > 0) {
          progress.setValue(player.currentTime / player.duration);
          // If video ended, go to next story
          if (
            player.status === 'readyToPlay' &&
            player.currentTime >= player.duration - 0.1 &&
            player.duration > 0
          ) {
            next();
          }
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [player, current, content]);

  function start() {
    setLoad(false);
    progress.setValue(0);
    startAnimation();
  }

  function startAnimation() {
    if (content[current]?.isVideo) {
      // Don't animate for video, progress is handled by useEffect above
      return;
    }

    Animated.timing(progress, {
      toValue: 1,
      duration: content[current].duration
        ? content[current].duration * 1000
        : duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        next();
      }
    });
  }

  function onSwipeUp(_props?: any) {
    if (onClosePress) {
      onClosePress();
    }
    if (content[current].onPress) {
      content[current].onPress?.();
    }
  }

  function onSwipeDown(_props?: any) {
    onClosePress();
  }

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  function next() {
    // check if the next content is not empty
    setLoad(true);
    if (current !== content.length - 1) {
      let data = [...content];
      data[current].finish = 1;
      setContent(data);
      setCurrent(current + 1);
      progress.setValue(0);
    } else {
      // the next content is empty
      close('next');
    }
  }

  function previous() {
    // checking if the previous content is not empty
    setLoad(true);
    if (current - 1 >= 0) {
      let data = [...content];
      data[current].finish = 0;
      setContent(data);
      setCurrent(current - 1);
      progress.setValue(0);
    } else {
      // the previous content is empty
      close('previous');
    }
  }

  function close(state: NextOrPrevious) {
    let data = [...content];
    data.map((x) => (x.finish = 0));
    setContent(data);
    progress.setValue(0);
    if (currentPage == index) {
      if (onFinish) {
        onFinish(state);
      }
    }
  }

  const swipeText =
    content?.[current]?.swipeText || props.swipeText || 'Swipe Up';

  React.useEffect(() => {
    if (onStorySeen && currentPage === index) {
      onStorySeen({
        id: userId,
        avatar_image: profileImage,
        user_name: profileName,
        story: content[current],
      });
    }
  }, [currentPage, index, onStorySeen, current]);

  return (
    <GestureRecognizer
      onSwipeUp={onSwipeUp}
      onSwipeDown={onSwipeDown}
      config={config}
      style={[styles.container, storyContainerStyle]}
    >
      <SafeAreaView>
        <View style={styles.backgroundContainer}>
          {content[current]?.isVideo ? (
            <VideoView
              player={player}
              style={[styles.video, storyVideoStyle]}
              contentFit="contain"
              nativeControls={false}
            />
          ) : (
            <Image
              onLoadEnd={() => start()}
              source={{ uri: content[current].story }}
              style={[styles.image, storyImageStyle]}
            />
          )}
          {load && (
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color={'white'} />
            </View>
          )}
        </View>
      </SafeAreaView>
      <View style={styles.flexCol}>
        <View
          style={[styles.animationBarContainer, animationBarContainerStyle]}
        >
          {content.map((_: IUserStoryItem, key: number) => {
            return (
              <View
                key={key}
                style={[styles.animationBackground, unloadedAnimationBarStyle]}
              >
                {/* @ts-ignore: Animated.View is valid in React Native */}
                <Animated.View
                  style={[
                    {
                      flex: current == key ? progress : content[key].finish,
                      height: 2,
                      backgroundColor: 'white',
                    },
                    loadedAnimationBarStyle,
                  ]}
                />
              </View>
            );
          })}
        </View>
        <View style={[styles.userContainer, storyUserContainerStyle]}>
          <View style={styles.flexRowCenter}>
            <Image
              style={[styles.avatarImage, storyAvatarImageStyle]}
              source={{ uri: profileImage }}
            />
            {typeof renderTextComponent === 'function' ? (
              renderTextComponent({
                item: content[current],
                profileName,
              })
            ) : (
              <Text style={styles.avatarText}>{profileName}</Text>
            )}
          </View>
          <View style={styles.closeIconContainer}>
            {typeof renderCloseComponent === 'function' ? (
              renderCloseComponent({
                onPress: onClosePress,
                item: content[current],
              })
            ) : (
              <TouchableOpacity
                onPress={() => {
                  if (onClosePress) {
                    onClosePress();
                  }
                }}
                hitSlop={20}
              >
                <Image
                  source={require('./assets/images/close.png')}
                  style={{ width: 15, height: 15 }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.pressContainer}>
          <TouchableWithoutFeedback
            onPressIn={() => progress.stopAnimation()}
            onLongPress={() => setPressed(true)}
            onPressOut={() => {
              setPressed(false);
              startAnimation();
            }}
            onPress={() => {
              if (!pressed && !load) {
                previous();
              }
            }}
          >
            <View style={styles.flex} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPressIn={() => progress.stopAnimation()}
            onLongPress={() => setPressed(true)}
            onPressOut={() => {
              setPressed(false);
              startAnimation();
            }}
            onPress={() => {
              if (!pressed && !load) {
                next();
              }
            }}
          >
            <View style={styles.flex} />
          </TouchableWithoutFeedback>
        </View>
      </View>
      {typeof renderSwipeUpComponent === 'function' ? (
        renderSwipeUpComponent({
          onPress: onSwipeUp,
          item: content[current],
        })
      ) : (
        <TouchableOpacity
          activeOpacity={1}
          onPress={onSwipeUp}
          style={styles.swipeUpBtn}
        >
          <Text style={styles.swipeText}></Text>
          <Text style={styles.swipeText}>{swipeText}</Text>
        </TouchableOpacity>
      )}
    </GestureRecognizer>
  );
};

export default StoryListItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  flex: {
    flex: 1,
  },
  flexCol: {
    flex: 1,
    flexDirection: 'column',
  },
  flexRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  spinnerContainer: {
    zIndex: -100,
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: 'black',
    alignSelf: 'center',
    width: width,
    height: height,
  },
  animationBarContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  animationBackground: {
    height: 2,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(117, 117, 117, 0.5)',
    marginHorizontal: 2,
  },
  userContainer: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  avatarImage: {
    height: 30,
    width: 30,
    borderRadius: 100,
  },
  avatarText: {
    fontWeight: 'bold',
    color: 'white',
    paddingLeft: 10,
  },
  closeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    paddingHorizontal: 15,
  },
  pressContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  swipeUpBtn: {
    position: 'absolute',
    right: 0,
    left: 0,
    alignItems: 'center',
    bottom: Platform.OS == 'ios' ? 20 : 50,
  },
  whiteText: {
    color: 'white',
  },
  swipeText: {
    color: 'white',
    marginTop: 5,
  },
  video: {
    height: Math.floor(height),
    width: Math.floor(width),
  },
});
