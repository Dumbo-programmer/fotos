import React from "react"
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
  SharedValue,
} from "react-native-reanimated"

import RecyclerAssetList from "./recycler-asset-list"
import GridProvider from "./grid-provider/gridContext"
import PinchZoom from "./grid-provider/pinchZoom"

import { RecyclerAssetListSection } from "../../types"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../navigators/home-navigator"
interface Props {
  refreshData: () => Promise<void>
  sections: RecyclerAssetListSection[]
  scrollY: SharedValue<number> | undefined
  navigation: NativeStackNavigationProp<HomeNavigationParamList, HomeNavigationTypes>
}

const AssetList = ({ refreshData, sections, scrollY, navigation }: Props): JSX.Element => {
  const translationY = useSharedValue(0)
  const scrollRefExternal = useAnimatedRef<Animated.ScrollView>()

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      translationY.value = event.contentOffset.y

      if (scrollY) scrollY.value = translationY.value
    },
    onBeginDrag: (e) => {
      //isScrolling.value = true;
    },
    onEndDrag: (e) => {
      //isScrolling.value = false;
    },
  })
  return (
    <GridProvider>
      <PinchZoom>
        <RecyclerAssetList
          navigation={navigation}
          refreshData={refreshData}
          sections={sections}
          scrollHandler={scrollHandler}
          scrollRef={scrollRefExternal}
          scrollY={scrollY}
        />
      </PinchZoom>
    </GridProvider>
  )
}

export default AssetList
