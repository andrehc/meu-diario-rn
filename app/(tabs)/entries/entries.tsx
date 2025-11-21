import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBarBackground, ThemedText, ThemedView, Toast } from '../../../src/components';
import { getMoodEmoji } from '../../../src/constants/moodOptions';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTheme, useToast } from '../../../src/hooks';
import { DiaryService } from '../../../src/services/diaryService';
import { DiaryEntry } from '../../../src/types/database';

const ITEMS_PER_PAGE = 10;

export default function EntriesScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const toast = useToast();

    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000); // Convertendo de timestamp para Date
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: '2-digit'
        });
    };

    const loadEntries = useCallback(async (pageNumber: number = 0, isRefresh: boolean = false) => {
        if (!user?.id) return;

        try {
            if (pageNumber === 0) {
                isRefresh ? setRefreshing(true) : setLoading(true);
            } else {
                setLoadingMore(true);
            }

            console.log('📄 [ENTRIES] Carregando página:', pageNumber);

            // Simulando paginação já que o DiaryService atual não suporta
            const allEntries = await DiaryService.getDiaryEntriesForProfile(user.id);
            const startIndex = pageNumber * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const pageEntries = allEntries.slice(startIndex, endIndex);

            console.log('📄 [ENTRIES] Entradas da página:', pageEntries.length);

            if (pageNumber === 0) {
                setEntries(pageEntries);
            } else {
                setEntries(prev => [...prev, ...pageEntries]);
            }

            setHasMore(pageEntries.length === ITEMS_PER_PAGE);
            setPage(pageNumber);

        } catch (error) {
            console.error('❌ [ENTRIES] Erro ao carregar entradas:', error);
            toast.showError('Erro', 'Não foi possível carregar as entradas');
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadEntries(0);
    }, [loadEntries]);

    const handleRefresh = useCallback(() => {
        loadEntries(0, true);
    }, [loadEntries]);

    const handleLoadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            loadEntries(page + 1);
        }
    }, [loadEntries, loadingMore, hasMore, page]);

    const handleEntryPress = (entry: DiaryEntry) => {
        // Navegar para detalhes da entrada ou edição
        showEntryDetails(entry);
    };

    const showEntryDetails = (entry: DiaryEntry) => {
        // Navegar para tela de detalhes dentro da pasta entries
        router.push(`/(tabs)/entries/details?id=${entry.id}`);
    };

    const deleteEntry = async (entry: DiaryEntry) => {
        try {
            await DiaryService.deleteDiaryEntry(entry.id);
            
            // Remove da lista local para feedback imediato
            setEntries(prev => prev.filter(item => item.id !== entry.id));
            
            toast.showSuccess('Sucesso', 'Entrada deletada com sucesso!');
        } catch (error) {
            console.error('❌ [ENTRIES] Erro ao deletar entrada:', error);
            toast.showError('Erro', 'Não foi possível deletar a entrada.');
        }
    };

    const handleEntryMenu = (entry: DiaryEntry) => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancelar', 'Ver Detalhes', 'Apagar'],
                    destructiveButtonIndex: 2,
                    cancelButtonIndex: 0,
                },
                (buttonIndex: number) => {
                    if (buttonIndex === 1) {
                        showEntryDetails(entry);
                    } else if (buttonIndex === 2) {
                        Alert.alert(
                            'Confirmar Exclusão',
                            'Tem certeza que deseja apagar esta entrada? Esta ação não pode ser desfeita.',
                            [
                                { text: 'Cancelar', style: 'cancel' },
                                { 
                                    text: 'Apagar', 
                                    style: 'destructive',
                                    onPress: () => deleteEntry(entry)
                                }
                            ]
                        );
                    }
                }
            );
        } else {
            // Para Android, usar Alert com opções
            Alert.alert(
                'Opções',
                'O que você gostaria de fazer com esta entrada?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                        text: 'Ver Detalhes', 
                        onPress: () => showEntryDetails(entry)
                    },
                    { 
                        text: 'Apagar', 
                        style: 'destructive',
                        onPress: () => {
                            Alert.alert(
                                'Confirmar Exclusão',
                                'Tem certeza que deseja apagar esta entrada? Esta ação não pode ser desfeita.',
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    { 
                                        text: 'Apagar', 
                                        style: 'destructive',
                                        onPress: () => deleteEntry(entry)
                                    }
                                ]
                            );
                        }
                    }
                ]
            );
        }
    };

    const renderEntry = ({ item }: { item: DiaryEntry }) => {
        const entryEmoji = getMoodEmoji(item.current_mood || '');

        return (
            <TouchableOpacity onPress={() => handleEntryPress(item)}>
                <ThemedView variant="card" style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                        <Text style={styles.smiley}>{entryEmoji}</Text>
                        <TouchableOpacity 
                            style={styles.moreIcon}
                            onPress={() => handleEntryMenu(item)}
                        >
                            <MaterialCommunityIcons
                                name="dots-vertical"
                                size={24}
                                color={colors.text.secondary}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.dateBadge, { backgroundColor: colors.primary }]}>
                        <AntDesign name="calendar" size={14} color={colors.text.inverse} />
                        <ThemedText
                            style={[styles.dateText, { color: colors.text.inverse }]}
                        >
                            {formatDate(item.created_at)}
                        </ThemedText>
                    </View>
                    <ThemedText variant="h3" style={styles.entryTitle}>
                        {item.title}
                    </ThemedText>
                    {item.thoughts && (
                        <ThemedText color="tertiary" style={styles.entryContent} numberOfLines={2}>
                            {item.thoughts}
                        </ThemedText>
                    )}
                </ThemedView>
            </TouchableOpacity>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <ThemedText color="secondary" style={styles.loadingText}>
                    Carregando mais entradas...
                </ThemedText>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <ThemedText variant="h3" color="secondary" style={styles.emptyTitle}>
                Nenhuma entrada encontrada
            </ThemedText>
            <ThemedText color="tertiary" style={styles.emptyDescription}>
                Comece a escrever suas memórias e emoções
            </ThemedText>
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/entries/add-entry')}
            >
                <ThemedText style={[styles.addButtonText, { color: colors.text.inverse }]}>
                    Criar primeira entrada
                </ThemedText>
            </TouchableOpacity>
        </View>
    );

    return (
        <>
            <StatusBarBackground />
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.surface }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <ThemedText variant="h2">Minhas Entradas</ThemedText>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/entries/add-entry')}>
                            <Ionicons name="add" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <ThemedText color="secondary" style={styles.loadingText}>
                            Carregando entradas...
                        </ThemedText>
                    </View>
                ) : (
                    <FlatList
                        data={entries}
                        renderItem={renderEntry}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={[colors.primary]}
                                tintColor={colors.primary}
                            />
                        }
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                        ListEmptyComponent={renderEmpty}
                    />
                )}
            </SafeAreaView>
            
            {/* Toast Component */}
            {toast.toastConfig && (
                <Toast
                    visible={toast.visible}
                    type={toast.toastConfig.type}
                    title={toast.toastConfig.title}
                    message={toast.toastConfig.message}
                    duration={toast.toastConfig.duration}
                    onHide={toast.hideToast}
                    actionText={toast.toastConfig.actionText}
                    onActionPress={toast.toastConfig.onActionPress}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backButton: {
        padding: 8,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 120, // Espaço para o BottomNavigation
    },
    entryCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    smiley: {
        fontSize: 28,
    },
    moreIcon: {
        padding: 4,
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 12,
        marginLeft: 4,
    },
    entryTitle: {
        marginBottom: 4,
    },
    entryContent: {
        lineHeight: 20,
        marginTop: 4,
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 60,
    },
    emptyTitle: {
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyDescription: {
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    addButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});