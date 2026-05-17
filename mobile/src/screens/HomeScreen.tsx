import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Modal, Alert, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Bell, Search, Store, Heart, ChevronDown, X, ChevronRight, Trash2, Trophy, Medal, Star, Leaf, Users, Sparkles, MessageCircle, Clock, Moon, Sun, Filter, ShoppingBag, Box } from 'lucide-react-native';
import { BottomTabBar } from '../components/BottomTabBar';
import { useAppStore, BRAZIL_LOCATIONS } from '../store/useAppStore';
import { styled } from 'nativewind';

const StyledSafeAreaView = styled(SafeAreaView);

const CATEGORIES = [
  { name: 'Todos', icon: Sparkles },
  { name: 'Padaria', icon: Store },
  { name: 'Frutas', icon: Leaf },
  { name: 'Refeições', icon: ShoppingBag },
  { name: 'Doces', icon: Star },
  { name: 'Laticínios', icon: Box },
];

const RANKING_DATA = [
  { id: 1, name: 'Ana Oliveira', points: 2450, saves: 42, co2: '12.5kg' },
  { id: 2, name: 'Marcos Santos', points: 2100, saves: 38, co2: '10.2kg' },
  { id: 3, name: 'Carla Silva', points: 1850, saves: 31, co2: '8.7kg' },
  { id: 4, name: 'Ricardo Lima', points: 1600, saves: 27, co2: '7.1kg' },
  { id: 5, name: 'Sílvia Costa', points: 1420, saves: 22, co2: '5.9kg' },
];

const NOTIFICATIONS = [
  { id: 1, title: 'Nova doação perto de você!', message: 'Padaria Central acabou de postar pães fresquinhos.', time: '2 min', type: 'alert', icon: Store },
  { id: 2, title: 'Parabéns, Herói!', message: 'Você subiu para o 12º lugar no ranking de São Paulo.', time: '1h', type: 'ranking', icon: Trophy },
  { id: 3, title: 'Impacto Verde', message: 'Suas doações já evitaram 4kg de CO2 este mês.', time: '5h', type: 'impact', icon: Leaf },
  { id: 4, title: 'Alimento Reservado', message: 'Alguém reservou sua doação de Maçãs.', time: 'Yesterday', type: 'msg', icon: MessageCircle },
];

const FoodCard = ({ item, isDarkMode, cardColor, borderColor, textColor, subTextColor, onDelete }: any) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <TouchableOpacity activeOpacity={0.9} className="w-[48%] mb-8">
      <View className={`${cardColor} rounded-[32px] overflow-hidden shadow-2xl shadow-black/5 border ${borderColor}`}>
        <View className="relative">
          <View className={`w-full h-40 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'} items-center justify-center overflow-hidden`}>
            <ActivityIndicator color="#10B981" style={{ position: 'absolute' }} />
            <Image source={{ uri: item.imagem }} className="w-full h-full" resizeMode="cover" />
          </View>
          <View className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
            <Text className="text-gray-900 text-[9px] font-black uppercase tracking-tighter">Expira {item.tempoExpiracao}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setIsLiked(!isLiked)}
            className="absolute top-3 right-3 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full items-center justify-center"
          >
            <Heart size={14} color={isLiked ? '#EF4444' : 'white'} fill={isLiked ? '#EF4444' : 'transparent'} />
          </TouchableOpacity>
        </View>
        <View className="p-4">
          <Text className={`${textColor} font-black text-[15px] mb-1 tracking-tight leading-tight`} numberOfLines={1}>{item.titulo}</Text>
          <View className="flex-row items-center mb-3">
            <Text className={`${subTextColor} text-[11px] font-bold`} numberOfLines={1}>{item.estabelecimento}</Text>
          </View>
          <View className={`flex-row justify-between items-center pt-2 border-t ${borderColor}`}>
            <View className="bg-green-500/10 px-2 py-1 rounded-lg">
              <Text className="text-green-500 text-[10px] font-black uppercase">{item.distancia}</Text>
            </View>
            {item.estabelecimento === 'Minha Doação' ? (
              <TouchableOpacity onPress={() => onDelete(item.id, item.titulo)} className="bg-red-500/10 p-1.5 rounded-lg">
                <Trash2 size={14} color="#EF4444" />
              </TouchableOpacity>
            ) : (
              <View className={`w-8 h-1 ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'} rounded-full`} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const { donations, localizacao, setLocalizacao, removeDonation, user, isDarkMode, toggleDarkMode } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const handleSelectCity = (city: string) => {
    const stateMap: { [key: string]: string } = {
      'São Paulo': 'SP', 'Rio de Janeiro': 'RJ', 'Minas Gerais': 'MG', 'Paraná': 'PR',
      'Bahia': 'BA', 'Santa Catarina': 'SC', 'Rio Grande do Sul': 'RS', 'Ceará': 'CE',
      'Pernambuco': 'PE', 'Distrito Federal': 'DF', 'Goiás': 'GO', 'Amazonas': 'AM',
      'Espírito Santo': 'ES', 'Mato Grosso': 'MT'
    };
    const stateAbbr = stateMap[selectedState || ''] || 'BR';
    setLocalizacao(`${city}, ${stateAbbr}`);
    setShowLocationModal(false);
    setSelectedState(null);
  };

  const handleDeleteDonation = (id: string, title: string) => {
    Alert.alert(
      "Excluir publicação",
      `Tem certeza que deseja remover "${title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => removeDonation(id) }
      ]
    );
  };

  const filteredDonations = donations.filter((item) => {
    const matchesCategory = activeCategory === 'Todos' || 
                           item.categoria.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = item.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.categoria.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const bgColor = isDarkMode ? 'bg-[#0F172A]' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const cardColor = isDarkMode ? 'bg-[#1E293B]' : 'bg-white';
  const borderColor = isDarkMode ? 'border-[#334155]' : 'border-gray-50';
  const inputColor = isDarkMode ? 'bg-[#1E293B]' : 'bg-gray-50';

  return (
    <StyledSafeAreaView className={`flex-1 ${bgColor}`}>
      {/* 📍 Location Modal */}
      <Modal visible={showLocationModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'} rounded-t-[40px] h-[80%] px-6 pt-8`}>
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className={`text-3xl font-black ${textColor} tracking-tighter`}>
                  {selectedState ? 'Escolha a Cidade' : 'Escolha o Estado'}
                </Text>
                <Text className={`${subTextColor} font-medium mt-1`}>
                  {selectedState ? `Em ${selectedState}` : 'Para encontrar doações perto de você'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => { setShowLocationModal(false); setSelectedState(null); }} className={`w-10 h-10 ${isDarkMode ? 'bg-white/10' : 'bg-gray-50'} rounded-full items-center justify-center`}>
                <X size={20} color={isDarkMode ? 'white' : '#111827'} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {!selectedState ? (
                BRAZIL_LOCATIONS.map((loc) => (
                  <TouchableOpacity key={loc.state} onPress={() => setSelectedState(loc.state)} className={`flex-row items-center justify-between py-5 border-b ${borderColor}`}>
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 bg-green-500/10 rounded-2xl items-center justify-center mr-4">
                        <MapPin size={22} color="#10B981" />
                      </View>
                      <Text className={`text-lg font-bold ${textColor}`}>{loc.state}</Text>
                    </View>
                    <ChevronRight size={20} color={isDarkMode ? '#475569' : '#D1D5DB'} />
                  </TouchableOpacity>
                ))
              ) : (
                <>
                  <TouchableOpacity onPress={() => setSelectedState(null)} className="mb-4 flex-row items-center">
                    <Text className="text-green-500 font-bold">← Voltar para estados</Text>
                  </TouchableOpacity>
                  {BRAZIL_LOCATIONS.find(s => s.state === selectedState)?.cities.map((city) => (
                    <TouchableOpacity key={city} onPress={() => handleSelectCity(city)} className={`flex-row items-center py-5 border-b ${borderColor}`}>
                      <View className="w-2 h-2 bg-green-500 rounded-full mr-4" />
                      <Text className={`text-lg font-bold ${textColor}`}>{city}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 🏆 Community Ranking Modal */}
      <Modal visible={showRankingModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'} rounded-t-[40px] h-[85%]`}>
            <View className="bg-green-500 px-6 pt-12 pb-10 rounded-t-[40px] items-center relative">
              <TouchableOpacity onPress={() => setShowRankingModal(false)} className="absolute top-6 right-6 w-10 h-10 bg-black/10 rounded-full items-center justify-center">
                <X size={20} color="white" />
              </TouchableOpacity>
              <View className="w-20 h-20 bg-white/20 rounded-3xl items-center justify-center mb-4">
                <Trophy size={40} color="white" />
              </View>
              <Text className="text-white text-3xl font-black tracking-tighter">Heróis do Mês</Text>
              <Text className="text-white/80 font-bold mt-1 uppercase text-[10px] tracking-[2px]">{localizacao}</Text>
            </View>

            <View className="flex-1 px-6 -mt-6">
              <View className={`${cardColor} rounded-[32px] p-6 shadow-xl shadow-black/10 mb-6 border ${borderColor}`}>
                <View className="flex-row justify-between items-center mb-6">
                  <View className="flex-row items-center">
                    <Users size={16} color="#10B981" />
                    <Text className={`${subTextColor} font-bold text-xs uppercase ml-2`}>Sua posição</Text>
                  </View>
                  <Text className="text-green-500 font-black">#12º lugar</Text>
                </View>
                <View className="flex-row justify-between">
                  <View>
                    <Text className={`${textColor} font-black text-xl`}>15</Text>
                    <Text className={`${subTextColor} text-[10px] font-bold uppercase`}>Itens Salvos</Text>
                  </View>
                  <View className="items-center">
                    <Text className={`${textColor} font-black text-xl`}>4kg</Text>
                    <Text className={`${subTextColor} text-[10px] font-bold uppercase`}>CO2 Evitado</Text>
                  </View>
                  <View className="items-end">
                    <Text className={`${textColor} font-black text-xl`}>850</Text>
                    <Text className={`${subTextColor} text-[10px] font-bold uppercase`}>Pontos</Text>
                  </View>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className={`${subTextColor} font-black text-[10px] uppercase tracking-widest mb-4 ml-2`}>Top 5 Colaboradores</Text>
                {RANKING_DATA.map((item, index) => (
                  <View key={item.id} className={`flex-row items-center ${isDarkMode ? 'bg-[#1E293B]' : 'bg-gray-50'} p-5 rounded-3xl mb-3 border ${borderColor}`}>
                    <View className="w-8 items-center mr-4">
                      {index < 3 ? (
                        <Medal size={22} color={index === 0 ? '#FBBF24' : index === 1 ? '#94A3B8' : '#B45309'} />
                      ) : (
                        <Text className="text-gray-500 font-black">#{index + 1}</Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className={`${textColor} font-bold text-lg`}>{item.name}</Text>
                      <View className="flex-row items-center mt-0.5">
                        <Leaf size={12} color="#10B981" />
                        <Text className={`${subTextColor} text-[11px] font-bold ml-1`}>{item.co2} salvos</Text>
                      </View>
                    </View>
                    <View className={`items-end ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'} px-4 py-2 rounded-2xl border ${borderColor}`}>
                      <Text className="text-green-500 font-black text-base">{item.points}</Text>
                      <Text className={`${subTextColor} text-[9px] font-bold uppercase tracking-tighter`}>pontos</Text>
                    </View>
                  </View>
                ))}
                <View className="h-20" />
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🔔 Notifications Modal */}
      <Modal visible={showNotificationsModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'} rounded-t-[40px] h-[70%]`}>
            <View className={`px-6 pt-8 pb-4 flex-row justify-between items-center border-b ${borderColor}`}>
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-500/10 rounded-xl items-center justify-center mr-3">
                  <Bell size={20} color="#10B981" />
                </View>
                <Text className={`text-2xl font-black ${textColor} tracking-tighter`}>Notificações</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNotificationsModal(false)} className={`w-10 h-10 ${isDarkMode ? 'bg-white/10' : 'bg-gray-50'} rounded-full items-center justify-center`}>
                <X size={20} color={isDarkMode ? 'white' : '#111827'} />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-6 pt-6" showsVerticalScrollIndicator={false}>
              {NOTIFICATIONS.map((notif) => {
                const Icon = notif.icon;
                return (
                  <TouchableOpacity key={notif.id} activeOpacity={0.7} className={`flex-row ${cardColor} border ${borderColor} p-5 rounded-[32px] mb-4 shadow-sm`}>
                    <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                      notif.type === 'alert' ? 'bg-orange-500/10' : 
                      notif.type === 'ranking' ? 'bg-blue-500/10' : 
                      notif.type === 'impact' ? 'bg-green-500/10' : 'bg-gray-500/10'
                    }`}>
                      <Icon size={24} color={
                        notif.type === 'alert' ? '#F97316' : 
                        notif.type === 'ranking' ? '#3B82F6' : 
                        notif.type === 'impact' ? '#10B981' : '#64748B'
                      } />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start mb-1">
                        <Text className={`${textColor} font-bold text-base flex-1 pr-2`}>{notif.title}</Text>
                        <Text className={`${subTextColor} text-[10px] font-bold uppercase`}>{notif.time}</Text>
                      </View>
                      <Text className={`${subTextColor} text-sm leading-tight`}>{notif.message}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <View className="items-center py-10">
                <Text className={`${subTextColor} font-bold text-xs uppercase tracking-widest`}>Isso é tudo por hoje!</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View className={`px-6 py-6 flex-row justify-between items-end ${bgColor}`}>
        <View>
          <View className="flex-row items-center mb-1">
            <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            <Text className={`${subTextColor} text-[11px] font-black uppercase tracking-[2px]`}>Explorar perto de si</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setShowLocationModal(true)} className="flex-row items-center">
            <MapPin size={18} color="#10B981" />
            <Text className={`${textColor} font-black text-xl ml-2 tracking-tighter`}>{localizacao}</Text>
            <ChevronDown size={16} color={isDarkMode ? '#475569' : '#9CA3AF'} className="ml-1" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={toggleDarkMode}
            className={`w-12 h-12 ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'} rounded-2xl items-center justify-center mr-3 border ${borderColor}`}
          >
            {isDarkMode ? <Sun size={20} color="#FBBF24" /> : <Moon size={20} color="#475569" />}
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => setShowNotificationsModal(true)}
            className={`w-14 h-14 ${isDarkMode ? 'bg-white/10' : 'bg-gray-50'} rounded-[22px] items-center justify-center relative border ${borderColor} shadow-sm`}
          >
            <Bell size={24} color={isDarkMode ? 'white' : '#111827'} />
            <View className="absolute top-4 right-4 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        {/* Search */}
        <View className={`px-6 pt-2 pb-6 ${bgColor}`}>
          <View className={`flex-row items-center ${inputColor} border ${borderColor} rounded-[24px] px-5 py-4`}>
            <Search size={20} color={isDarkMode ? '#64748B' : '#9CA3AF'} />
            <TextInput
              className={`flex-1 ml-4 ${textColor} font-bold text-base`}
              placeholder="O que quer salvar hoje?"
              placeholderTextColor={isDarkMode ? '#475569' : '#9CA3AF'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Categories Bar */}
        <View className={`${bgColor} pb-6 pt-2`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.name;
              return (
                <TouchableOpacity 
                  key={cat.name}
                  onPress={() => setActiveCategory(cat.name)} 
                  className={`mr-3 px-5 py-3.5 rounded-2xl flex-row items-center border ${isActive ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/20' : `${cardColor} ${borderColor}`}`}
                >
                  <Icon size={16} color={isActive ? 'white' : '#10B981'} className="mr-2" />
                  <Text className={`font-black text-xs uppercase tracking-wider ${isActive ? 'text-white' : subTextColor}`}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Featured Card */}
        <View className="px-6 mb-8">
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => setShowRankingModal(true)}
            className={`w-full h-52 ${isDarkMode ? 'bg-[#1E293B]' : 'bg-gray-900'} rounded-[40px] overflow-hidden relative shadow-2xl`}
          >
            <View className="p-8 z-10">
              <View className="flex-row items-center mb-2">
                <Star size={14} color="#FBBF24" fill="#FBBF24" className="mr-2" />
                <Text className="text-white/60 font-black text-[10px] uppercase tracking-[3px]">Ranking da Comunidade</Text>
              </View>
              <Text className="text-white text-3xl font-black tracking-tighter leading-tight w-2/3">Seja um Herói do Mês!</Text>
              <View className={`mt-6 bg-green-500 self-start px-6 py-2.5 rounded-full flex-row items-center shadow-lg shadow-green-500/40`}>
                <Text className="text-white font-black text-[10px] uppercase">Ver Ranking</Text>
                <ChevronRight size={14} color="white" className="ml-1" />
              </View>
            </View>
            <View className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-500/20 rounded-full" />
            <View className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mt-16 -mr-16" />
          </TouchableOpacity>
        </View>

        {/* List Section */}
        <View className="px-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className={`text-2xl font-black ${textColor} tracking-tighter`}>Disponíveis Agora</Text>
            <TouchableOpacity><Text className="text-green-500 font-bold text-sm">Ver todos</Text></TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {filteredDonations.length === 0 ? (
              <View className={`w-full py-20 items-center ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-[32px] border-2 border-dashed ${borderColor}`}>
                <View className={`${cardColor} w-20 h-20 rounded-full items-center justify-center mb-4`}>
                  <Store size={32} color={isDarkMode ? '#475569' : '#D1D5DB'} />
                </View>
                <Text className={`${subTextColor} font-black text-lg`}>Sem resultados.</Text>
              </View>
            ) : (
              filteredDonations.map((item) => (
                <FoodCard 
                  key={item.id} 
                  item={item} 
                  isDarkMode={isDarkMode}
                  cardColor={cardColor}
                  borderColor={borderColor}
                  textColor={textColor}
                  subTextColor={subTextColor}
                  onDelete={handleDeleteDonation}
                />
              ))
            )}
          </View>
        </View>
        <View className="h-32" />
      </ScrollView>
      <BottomTabBar activeTab="Início" />
    </StyledSafeAreaView>
  );
};

export default HomeScreen;
