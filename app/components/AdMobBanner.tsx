import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";

interface AdMobBannerProps {
  adUnitID?: string;
  isTestMode?: boolean;
}

/**
 * AdMobBanner component displays an adaptive banner advertisement.
 * Uses Google AdMob with adaptive sizing for optimal display across devices.
 */
export default function AdMobBanner({
  adUnitID = "ca-app-pub-3940256099942544/9214589741",
  isTestMode = __DEV__,
}: AdMobBannerProps) {
  const [adSize, setAdSize] = useState(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [AdMobComponents, setAdMobComponents] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    // Only load AdMob on native platforms to prevent Metro bundling errors
    if (Platform.OS === "ios" || Platform.OS === "android") {
      const loadAdMob = async () => {
        try {
          // Use dynamic import with timeout to prevent hanging
          const loadPromise = new Promise((resolve, reject) => {
            try {
              // Use require with eval to prevent Metro from analyzing the import on web
              const AdMobModule = eval("require")(
                "react-native-google-mobile-ads",
              );
              resolve(AdMobModule);
            } catch (error) {
              reject(error);
            }
          });

          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("AdMob loading timeout")), 5000);
          });

          const AdMobModule = await Promise.race([loadPromise, timeoutPromise]);

          if (!isMounted) return;

          if (!AdMobModule) {
            throw new Error("AdMob module not available");
          }

          // Initialize AdMob with proper configuration and timeout
          const initPromise = AdMobModule.mobileAds().initialize();
          const initTimeoutPromise = new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error("AdMob initialization timeout")),
              10000,
            );
          });

          await Promise.race([initPromise, initTimeoutPromise]);

          if (!isMounted) return;

          setAdMobComponents({
            BannerAd: AdMobModule.BannerAd,
            BannerAdSize: AdMobModule.BannerAdSize,
            TestIds: AdMobModule.TestIds,
            useForeground: AdMobModule.useForeground,
            mobileAds: AdMobModule.mobileAds,
          });

          // Calculate adaptive banner size based on screen width
          const screenWidth = Dimensions.get("window").width;
          const density =
            Platform.OS === "android"
              ? require("react-native").PixelRatio.get()
              : 1;
          const adWidth = screenWidth / density;

          // Determine optimal ad size based on screen width
          if (adWidth >= 728) {
            setAdSize(AdMobModule.BannerAdSize.LEADERBOARD); // 728x90
          } else if (adWidth >= 468) {
            setAdSize(AdMobModule.BannerAdSize.BANNER); // 320x50
          } else if (adWidth >= 320) {
            setAdSize(AdMobModule.BannerAdSize.LARGE_BANNER); // 320x100
          } else {
            setAdSize(AdMobModule.BannerAdSize.BANNER); // Default 320x50
          }
        } catch (error) {
          console.warn("Failed to load AdMob module:", error);
          if (isMounted) {
            setAdError("Gagal memuat AdMob");
          }
        }
      };

      loadAdMob();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAdLoaded = () => {
    setIsAdLoaded(true);
    setAdError(null);
  };

  const handleAdFailedToLoad = (error: any) => {
    console.warn("AdMob Banner failed to load:", error);
    setAdError("Gagal memuat iklan");
    setIsAdLoaded(false);
  };

  const handleAdOpened = () => {
    console.log("AdMob Banner opened");
  };

  const handleAdClosed = () => {
    console.log("AdMob Banner closed");
  };

  // Web fallback - show placeholder instead of ad
  if (Platform.OS === "web") {
    return (
      <View
        style={styles.fallbackContainer}
        className="bg-[#FFEDF3] border-t border-[#ADEED9]"
      >
        <Text
          style={styles.fallbackText}
          className="text-center text-xs text-gray-500"
        >
          Iklan (Web Preview)
        </Text>
      </View>
    );
  }

  // Show loading state while AdMob is loading on native
  if (!AdMobComponents) {
    return (
      <View
        style={styles.container}
        className="bg-[#FFEDF3] border-t border-[#ADEED9]"
      >
        <View style={styles.loadingContainer}>
          <Text
            style={styles.loadingText}
            className="text-center text-xs text-gray-600"
          >
            Memuat iklan...
          </Text>
        </View>
      </View>
    );
  }

  // Fallback UI when ad fails to load
  if (adError && !isAdLoaded) {
    return (
      <View
        style={styles.fallbackContainer}
        className="bg-[#FFEDF3] border-t border-[#ADEED9]"
      >
        <Text
          style={styles.fallbackText}
          className="text-center text-xs text-gray-500"
        >
          Iklan tidak tersedia
        </Text>
      </View>
    );
  }

  // Use test ad unit ID in development mode
  const finalAdUnitId =
    isTestMode && AdMobComponents?.TestIds
      ? AdMobComponents.TestIds.ADAPTIVE_BANNER
      : adUnitID;

  const { BannerAd } = AdMobComponents;

  return (
    <View
      style={styles.container}
      className="bg-[#FFEDF3] border-t border-[#ADEED9]"
    >
      {/* Loading indicator */}
      {!isAdLoaded && (
        <View style={styles.loadingContainer}>
          <Text
            style={styles.loadingText}
            className="text-center text-xs text-gray-600"
          >
            Memuat iklan...
          </Text>
        </View>
      )}

      {/* AdMob Banner - Native only */}
      {BannerAd && adSize && (
        <BannerAd
          unitId={finalAdUnitId}
          size={adSize}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
            networkExtras: {
              collapsible: "bottom", // Collapsible banner for better UX
            },
          }}
          onAdLoaded={handleAdLoaded}
          onAdFailedToLoad={handleAdFailedToLoad}
          onAdOpened={handleAdOpened}
          onAdClosed={handleAdClosed}
        />
      )}

      {/* Ad label for compliance */}
      {isAdLoaded && (
        <Text
          style={styles.adLabel}
          className="text-center text-xs text-gray-500"
        >
          Iklan
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#FFEDF3",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
    paddingVertical: 5,
  },
  loadingContainer: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 10,
    color: "#666",
  },
  adLabel: {
    fontSize: 8,
    color: "#999",
    marginTop: 2,
  },
  fallbackContainer: {
    height: 40,
    width: "100%",
    backgroundColor: "#FFEDF3",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    fontSize: 10,
    color: "#999",
  },
});
