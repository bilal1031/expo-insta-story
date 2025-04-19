import React, { Fragment, useRef, useState, useEffect } from 'react';
import {
  Dimensions,
  View,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modalbox';

import StoryListItem from './StoryListItem';
import StoryCircleListView from './StoryCircleListView';
import { isNullOrWhitespace } from './helpers';
import AndroidCubeEffect from './components/AndroidCubeEffect';
import CubeNavigationHorizontal from './components/CubeNavigationHorizontal';
import { IUserStory, NextOrPrevious, StoryProps } from './interfaces';

const { height, width } = Dimensions.get('window');

export const Story = ({
  data,
  unPressedBorderColor = '#c7c7c7',
  pressedBorderColor = '#3867d6',
  unPressedAvatarTextColor = '#222222',
  pressedAvatarTextColor = '#3867d6',
  style = {},
  onStart,
  onClose,
  duration = 10,
  swipeText = 'Swipe Up',
  avatarSize = 60,
  showAvatarText = true,
  avatarTextStyle = {},
  onStorySeen,
  renderCloseComponent,
  renderSwipeUpComponent,
  renderTextComponent,
  renderCustomAvatarComponent,
  loadedAnimationBarStyle = {},
  unloadedAnimationBarStyle = {},
  animationBarContainerStyle = {},
  storyUserContainerStyle = {},
  storyImageStyle = {},
  storyAvatarImageStyle = {},
  storyContainerStyle = {},
  avatarImageStyle = {},
  avatarWrapperStyle = {},
  avatarFlatListProps = {},
  storyVideoStyle = {},
}: StoryProps & { showAvatarText?: boolean }) => {
  const [dataState, setDataState] = useState<IUserStory[]>(data);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [currentStory, setCurrentStory] = useState<number>(0);
  const [selectedData, setSelectedData] = useState<IUserStory[]>([]);
  const [showLoading, setShowLoading] = useState<boolean>(true);
  const cube = useRef<CubeNavigationHorizontal | AndroidCubeEffect>();

  // Component Functions
  const _handleStoryItemPress = (item: IUserStory, index?: number) => {
    // const newData = dataState.slice(index);
    if (onStart) {
      onStart(item);
    }

    setCurrentPage(0);
    setSelectedData(dataState);
    setIsModalOpen(true);

    const storyIndex = dataState.findIndex(
      (story: IUserStory) => story.id == item.id,
    );
    setCurrentStory(storyIndex);
  };

  useEffect(() => {
    handleSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSeen = () => {
    const seen = selectedData[currentPage];
    const seenIndex = dataState.indexOf(seen);
    if (seenIndex > 0) {
      if (!dataState[seenIndex]?.seen) {
        let tempData = dataState;
        dataState[seenIndex] = {
          ...dataState[seenIndex],
          seen: true,
        };
        setDataState(tempData);
      }
    }
  };

  function onStoryFinish(state: NextOrPrevious) {
    if (!isNullOrWhitespace(state)) {
      if (state == 'next') {
        const newPage = currentPage + 1;
        if (newPage < selectedData.length) {
          setCurrentPage(newPage);
          cube?.current?.scrollTo(newPage);
        } else {
          setIsModalOpen(false);
          setCurrentPage(0);
          if (onClose) {
            onClose(selectedData[selectedData.length - 1]);
          }
        }
      } else if (state == 'previous') {
        const newPage = currentPage - 1;
        if (newPage < 0) {
          setIsModalOpen(false);
          setCurrentPage(0);
        } else {
          setCurrentPage(newPage);
          // cube?.current?.scrollTo(newPage);
        }
      }
    }
  }

  const renderStoryList = () =>
    selectedData.map((x: any, i: number) => {
      return (
        <StoryListItem
          duration={duration * 1000}
          key={i}
          userId={x.id}
          profileName={x.user_name}
          profileImage={x.avatar_image}
          stories={x.stories}
          currentPage={currentPage}
          onFinish={onStoryFinish}
          swipeText={swipeText}
          renderSwipeUpComponent={renderSwipeUpComponent}
          renderCloseComponent={renderCloseComponent}
          renderTextComponent={renderTextComponent}
          onClosePress={() => {
            setIsModalOpen(false);
            if (onClose) {
              onClose(x);
            }
          }}
          index={i}
          onStorySeen={onStorySeen}
          unloadedAnimationBarStyle={unloadedAnimationBarStyle}
          animationBarContainerStyle={animationBarContainerStyle}
          loadedAnimationBarStyle={loadedAnimationBarStyle}
          storyUserContainerStyle={storyUserContainerStyle}
          storyImageStyle={storyImageStyle}
          storyAvatarImageStyle={storyAvatarImageStyle}
          storyContainerStyle={storyContainerStyle}
          storyVideoStyle={storyVideoStyle}
        />
      );
    });

  const renderCube = () => {
    if (Platform.OS == 'ios') {
      return (
        <CubeNavigationHorizontal
          ref={cube as React.LegacyRef<CubeNavigationHorizontal>}
          callBackAfterSwipe={(x: any) => {
            if (x != currentPage) {
              setCurrentPage(parseInt(x));
            }
          }}
        >
          {renderStoryList()}
        </CubeNavigationHorizontal>
      );
    } else {
      return (
        <AndroidCubeEffect
          ref={cube as React.LegacyRef<AndroidCubeEffect>}
          callBackAfterSwipe={(x: any) => {
            if (x != currentPage) {
              setCurrentPage(parseInt(x));
            }
          }}
        >
          {renderStoryList()}
        </AndroidCubeEffect>
      );
    }
  };

  const renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="white" size={26} />
      </View>
    );
  };

  return (
    <Fragment>
      <View style={style}>
        <StoryCircleListView
          handleStoryItemPress={_handleStoryItemPress}
          data={dataState}
          avatarSize={avatarSize}
          unPressedBorderColor={unPressedBorderColor}
          pressedBorderColor={pressedBorderColor}
          unPressedAvatarTextColor={unPressedAvatarTextColor}
          pressedAvatarTextColor={pressedAvatarTextColor}
          showText={showAvatarText}
          avatarTextStyle={avatarTextStyle}
          avatarWrapperStyle={avatarWrapperStyle}
          avatarImageStyle={avatarImageStyle}
          avatarFlatListProps={avatarFlatListProps}
          renderCustomAvatarComponent={renderCustomAvatarComponent}
        />
      </View>

      <Modal
        onOpened={() => {
          setShowLoading(false);
          cube.current?.setCurrentPage(currentStory);
        }}
        style={styles.modal}
        isOpen={isModalOpen}
        onClosed={() => {
          setIsModalOpen(false);
          setShowLoading(true);
        }}
        position="center"
        swipeToClose
        swipeArea={250}
        backButtonClose
        coverScreen={true}
      >
        {showLoading && renderLoading()}
        {renderCube()}
      </Modal>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    height,
    width,
  },
  loadingContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 999,
    height: '100%',
    width: '100%',
  },
  loading: {
    fontSize: 12,
    color: 'white',
  },
});

export default Story;
