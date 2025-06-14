import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Search, Heart } from "lucide-react-native";

const BASEROW_TOKEN = "nhg3j7C6oD37cs9NObD3PI4fQd5HNf3L";
const TABLE_ID = "550282";

interface DoaItem {
  id: number;
  "Nama Do'a": string;
}

interface DoaListProps {
  onSelectDoa?: (id: string) => void;
}

const DoaList = ({
  onSelectDoa = (id) => router.push(`/doa/${id}`),
}: DoaListProps) => {
  const [doaList, setDoaList] = useState<DoaItem[]>([]);
  const [filteredDoaList, setFilteredDoaList] = useState<DoaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<number[]>([]);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchDoaList();
  }, []);

  const fetchDoaList = async () => {
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
      const doaData = data.results || [];
      setDoaList(doaData);
      setFilteredDoaList(doaData);
    } catch (err) {
      console.error("Error fetching doa list:", err);
      setError("Gagal memuat daftar doa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (query.trim() === "") {
      setFilteredDoaList(doaList);
    } else {
      const filtered = doaList.filter((doa) =>
        doa["Nama Do'a"].toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredDoaList(filtered);
    }
  };

  const toggleFavorite = (doaId: number) => {
    setFavorites((prev) =>
      prev.includes(doaId)
        ? prev.filter((id) => id !== doaId)
        : [...prev, doaId],
    );
  };

  const showFavorites = () => {
    const favoriteDoaList = doaList.filter((doa) => favorites.includes(doa.id));
    setFilteredDoaList(favoriteDoaList);
    setCurrentPage(1);
  };

  const showAllDoa = () => {
    setFilteredDoaList(doaList);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const renderDoaItem = ({ item }: { item: DoaItem }) => (
    <View className="p-4 border-b border-gray-100 bg-white rounded-lg mb-2 mx-2 shadow-sm">
      <TouchableOpacity
        className="flex-row justify-between items-center"
        onPress={() => onSelectDoa(item.id.toString())}
      >
        <View className="flex-1">
          <Text className="text-lg font-medium text-[#0ABAB5] mb-1">
            {item["Nama Do'a"]}
          </Text>
          <Text className="text-sm text-gray-600">
            Klik untuk membaca doa lengkap
          </Text>
        </View>
        <TouchableOpacity
          className={`ml-3 p-3 rounded-full border-2 ${
            favorites.includes(item.id)
              ? "bg-[#FF6B6B] border-[#FF6B6B]"
              : "bg-white border-[#FF6B6B]"
          }`}
          onPress={() => toggleFavorite(item.id)}
        >
          <Heart
            size={20}
            color={favorites.includes(item.id) ? "white" : "#FF6B6B"}
            fill={favorites.includes(item.id) ? "white" : "transparent"}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = () => (
    <View className="flex-1 items-center justify-center py-10">
      <Text className="text-gray-500 text-lg">
        {error ? error : "Tidak ada doa tersedia"}
      </Text>
    </View>
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredDoaList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredDoaList.slice(startIndex, endIndex);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // Calculate which pages to show (max 3 at a time)
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);

    // Adjust if we're near the end
    if (endPage - startPage < 2) {
      startPage = Math.max(1, endPage - 2);
    }

    const pagesToShow = [];
    for (let i = startPage; i <= endPage; i++) {
      pagesToShow.push(i);
    }

    return (
      <View className="flex-row justify-center items-center py-4 bg-[#FFEDF3]">
        {/* Previous button */}
        {currentPage > 1 && (
          <TouchableOpacity
            className="mx-2 px-3 py-2 rounded-full bg-[#ADEED9]"
            onPress={() => setCurrentPage(currentPage - 1)}
          >
            <Text className="text-[#0ABAB5] font-medium">‹</Text>
          </TouchableOpacity>
        )}

        {/* Page numbers */}
        {pagesToShow.map((pageNum) => (
          <TouchableOpacity
            key={pageNum}
            className={`mx-1 px-4 py-2 rounded-full ${
              currentPage === pageNum ? "bg-[#0ABAB5]" : "bg-[#ADEED9]"
            }`}
            onPress={() => setCurrentPage(pageNum)}
          >
            <Text
              className={`font-medium ${
                currentPage === pageNum ? "text-white" : "text-[#0ABAB5]"
              }`}
            >
              {pageNum}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Show dots if there are more pages */}
        {endPage < totalPages && (
          <Text className="mx-2 text-[#0ABAB5]">...</Text>
        )}

        {/* Next button */}
        {currentPage < totalPages && (
          <TouchableOpacity
            className="mx-2 px-3 py-2 rounded-full bg-[#ADEED9]"
            onPress={() => setCurrentPage(currentPage + 1)}
          >
            <Text className="text-[#0ABAB5] font-medium">›</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#FFEDF3]">
      {/* Search Bar */}
      <View className="px-4 py-3 bg-[#FFEDF3]">
        <View className="flex-row items-center bg-white rounded-full px-4 py-3 border border-[#0ABAB5]">
          <Search size={20} color="#0ABAB5" />
          <TextInput
            className="flex-1 ml-3 text-gray-700"
            placeholder="Cari doa..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Favorite Button */}
      <View className="px-4 pb-3 flex-row gap-2">
        <TouchableOpacity
          className="bg-white rounded-full px-6 py-3 border-2 border-[#FF6B6B] flex-row items-center justify-center flex-1"
          onPress={showFavorites}
        >
          <Heart size={20} color="#FF6B6B" fill="#FF6B6B" />
          <Text className="ml-2 text-[#FF6B6B] font-medium">
            Favorit ({favorites.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#0ABAB5] rounded-full px-6 py-3 flex-row items-center justify-center flex-1"
          onPress={showAllDoa}
        >
          <Text className="text-white font-medium">Semua Doa</Text>
        </TouchableOpacity>
      </View>

      {/* Doa List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0ABAB5" />
        </View>
      ) : (
        <>
          <FlatList
            data={currentPageData}
            renderItem={renderDoaItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={renderEmptyList}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          {renderPagination()}
        </>
      )}
    </View>
  );
};

export default DoaList;
