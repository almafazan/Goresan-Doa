import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react-native";
import AdMobBanner from "../components/AdMobBanner";

const BASEROW_TOKEN = "nhg3j7C6oD37cs9NObD3PI4fQd5HNf3L";
const TABLE_ID = "550282";

interface DoaData {
  id: number;
  "Nama Do'a": string;
  "Kalimat Do'a": string;
  "Arti Do'a": string;
}

export default function DoaDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [currentDoa, setCurrentDoa] = useState<DoaData | null>(null);
  const [allDoaList, setAllDoaList] = useState<DoaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    fetchDoaData();
  }, [id]);

  const fetchDoaData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/?user_field_names=true`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${BASEROW_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const doaList = data.results || [];
      setAllDoaList(doaList);

      // Find the current doa by id
      const doaId = typeof id === "string" ? parseInt(id) : 1;
      const foundDoa = doaList.find((doa: DoaData) => doa.id === doaId);
      setCurrentDoa(foundDoa || doaList[0] || null);
    } catch (err) {
      console.error("Error fetching doa data:", err);
      setError("Gagal memuat data doa");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToDoa = (doaId: number) => {
    router.push(`/doa/${doaId}`);
  };

  const navigateToNextDoa = () => {
    if (!currentDoa || allDoaList.length === 0) return;

    const currentIndex = allDoaList.findIndex(
      (doa) => doa.id === currentDoa.id,
    );
    const nextIndex = (currentIndex + 1) % allDoaList.length;
    navigateToDoa(allDoaList[nextIndex].id);
  };

  const navigateToPreviousDoa = () => {
    if (!currentDoa || allDoaList.length === 0) return;

    const currentIndex = allDoaList.findIndex(
      (doa) => doa.id === currentDoa.id,
    );
    const previousIndex =
      (currentIndex - 1 + allDoaList.length) % allDoaList.length;
    navigateToDoa(allDoaList[previousIndex].id);
  };

  const toggleFavorite = (doaId: number) => {
    setFavorites((prev) =>
      prev.includes(doaId)
        ? prev.filter((id) => id !== doaId)
        : [...prev, doaId],
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FFEDF3]">
        <ActivityIndicator size="large" color="#0ABAB5" />
        <Text className="text-lg text-[#0ABAB5] mt-2">Memuat doa...</Text>
      </View>
    );
  }

  if (error || !currentDoa) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FFEDF3]">
        <Text className="text-lg text-red-500 text-center px-4">
          {error || "Doa tidak ditemukan"}
        </Text>
        <TouchableOpacity
          className="mt-4 bg-[#0ABAB5] px-6 py-2 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FFEDF3]">
      {/* Header */}
      <View className="bg-[#0ABAB5] p-4 items-center">
        <TouchableOpacity
          className="absolute left-4 top-4"
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#FFEDF3" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Goresan Doa</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-4">
        {/* Doa Name with Favorite Button */}
        <View className="bg-[#56DFCF] rounded-lg p-4 mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xl font-bold text-center text-white">
              {currentDoa["Nama Do'a"]}
            </Text>
          </View>
          <TouchableOpacity
            className={`ml-4 p-3 rounded-full border-2 ${
              favorites.includes(currentDoa.id)
                ? "bg-[#FF6B6B] border-[#FF6B6B]"
                : "bg-white border-[#FF6B6B]"
            }`}
            onPress={() => toggleFavorite(currentDoa.id)}
          >
            <Heart
              size={20}
              color={favorites.includes(currentDoa.id) ? "white" : "#FF6B6B"}
              fill={favorites.includes(currentDoa.id) ? "white" : "transparent"}
            />
          </TouchableOpacity>
        </View>

        {/* Arabic Text */}
        <View className="bg-white rounded-lg p-6 mb-4">
          <Text
            className="text-2xl text-right leading-10 text-[#0ABAB5]"
            style={{ fontFamily: "System" }}
          >
            {currentDoa["Kalimat Do'a"]}
          </Text>
        </View>

        {/* Translation */}
        <View className="bg-[#ADEED9] rounded-lg p-4 mb-4">
          <Text className="text-base text-[#0ABAB5]">
            {currentDoa["Arti Do'a"]}
          </Text>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="bg-[#56DFCF] p-4">
        <View className="flex-row justify-between mb-3">
          <TouchableOpacity
            className="bg-[#0ABAB5] px-6 py-3 rounded-full flex-row items-center"
            onPress={navigateToPreviousDoa}
          >
            <ChevronLeft size={20} color="#FFEDF3" />
            <Text className="text-white ml-1">Doa Sebelumnya</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#0ABAB5] px-6 py-3 rounded-full flex-row items-center"
            onPress={navigateToNextDoa}
          >
            <Text className="text-white mr-1">Doa Selanjutnya</Text>
            <ChevronRight size={20} color="#FFEDF3" />
          </TouchableOpacity>
        </View>

        {/* Back to List Button */}
        <TouchableOpacity
          className="bg-[#ADEED9] px-6 py-3 rounded-full flex-row items-center justify-center"
          onPress={() => router.push("/")}
        >
          <Text className="text-[#0ABAB5] font-medium">Kembali ke Daftar</Text>
        </TouchableOpacity>
      </View>

      {/* AdMob Banner */}
      <AdMobBanner />
    </View>
  );
}
