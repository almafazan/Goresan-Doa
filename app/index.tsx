import React from "react";
import { View, Text, SafeAreaView, StatusBar } from "react-native";
import DoaList from "./components/DoaList";
import AdMobBanner from "./components/AdMobBanner";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#FFEDF3]">
      <StatusBar backgroundColor="#0ABAB5" barStyle="light-content" />
      <View className="flex-1 w-full max-w-md mx-auto">
        {/* Header */}
        <View className="bg-[#0ABAB5] px-4 py-6 rounded-b-lg shadow-md">
          <Text className="text-white text-2xl font-bold text-center">
            Goresan Doa
          </Text>
        </View>

        {/* Doa List */}
        <View className="flex-1 px-4 py-2">
          <DoaList />
        </View>

        {/* AdMob Banner */}
        <View className="w-full">
          <AdMobBanner />
        </View>
      </View>
    </SafeAreaView>
  );
}
