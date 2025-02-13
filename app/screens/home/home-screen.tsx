import React, { useEffect, useState } from "react"
import { StyleSheet, Text, Alert, View } from "react-native"
import * as MediaLibrary from "expo-media-library"
import LottieView from "lottie-react-native"
import { useSetRecoilState, useRecoilState } from "recoil"
import { Screen } from "../../components"
import { AssetService } from "../../services"
import { color } from "../../theme"
import AssetList from "../../components/asset-list"
import { RecyclerAssetListSection } from "../../types"
import { useFloatHederAnimation } from "../../utils/hooks"
import { palette } from "../../theme/palette"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../navigators/home-navigator"
import { mediasState, recyclerSectionsState } from "../../store"
interface HomeScreenProps {
  navigation: NativeStackNavigationProp<HomeNavigationParamList, HomeNavigationTypes>
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isReady, setIsReady] = useState(false)
  const setMedias = useSetRecoilState(mediasState)
  const [recyclerSections, setRecyclerSections] = useRecoilState(recyclerSectionsState);
  // Get a custom hook to animate the header
  const [scrollY, headerStyles] = useFloatHederAnimation(60)

  const requestAndroidPermission = async () => {
    try {
      console.log("requestAndroidPermission")
      await MediaLibrary.requestPermissionsAsync(true)
    } catch (err) {
      Alert.alert("Request permission", JSON.stringify(err))
      console.warn(err)
    } finally {
      setIsReady(true)
    }
  }
  useEffect(() => {
    requestAndroidPermission()
  }, [])
  useEffect(() => {
    navigation.setOptions({
      headerStyle: [headerStyles],
    })
  }, [])
  useEffect(() => {
    if (isReady) prepareAssets()
  }, [isReady])
  const prepareAssets = async () => {
    try {
      let first = 20
      const assetsArray = []
      let allMedias: MediaLibrary.PagedInfo<MediaLibrary.Asset> = null
      do {
        allMedias = await AssetService.getMedias(first, allMedias?.endCursor)
        assetsArray.push(...allMedias.assets)
        setRecyclerSections([...AssetService.categorizeAssets(assetsArray)]);
        setMedias([...assetsArray])
        console.log(
          "allMedias",
          assetsArray.length,
          allMedias.assets.length,
          allMedias.hasNextPage,
          allMedias.endCursor,
          assetsArray[assetsArray.length - 1]?.id,
        )
        if (!allMedias.hasNextPage) break
        first = first * 4
      } while (true)
    } catch (error) {
      console.error("prepareAssets:", error)
    }
  }
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
      backgroundColor={color.transparent}
    >
      {!recyclerSections ? (
        <View style={styles.loaderContainer}>
          <LottieView
            autoPlay={true}
            loop={true}
            source={require("../../../assets/lotties/photo-loading.json")}
          />
          <Text style={styles.loadingText}>Gathering photos</Text>
        </View>
      ) : !recyclerSections?.length ? (
        <Text style={styles.emptyText}>Gallery is empty!</Text>
      ) : (
        <AssetList sections={recyclerSections} scrollY={scrollY} navigation={navigation} />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  emptyText: {
    alignSelf: "center",
    fontSize: 24,
    fontWeight: "800",
  },
  loadingText: {
    alignSelf: "center",
    color: palette.lightGrey,
    fontSize: 16,
    marginTop: 250,
  },
  screen: {
    backgroundColor: palette.white,
    flex: 1,
    justifyContent: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
  },
})
