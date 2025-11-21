import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBarBackground, ThemedText, ThemedView, Toast } from '../../../src/components';
import { getMoodEmoji } from '../../../src/constants/moodOptions';
import { useTheme, useToast } from '../../../src/hooks';
import { DiaryService } from '../../../src/services/diaryService';
import { DiaryEntry } from '../../../src/types/database';

export default function DetailsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const toast = useToast();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [entry, setEntry] = useState<DiaryEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const loadEntry = async () => {
        if (!id) {
            setError('ID da entrada não encontrado');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const entryData = await DiaryService.getDiaryEntry(Number(id));
            
            if (!entryData) {
                setError('Entrada não encontrada');
                return;
            }
            
            setEntry(entryData);
        } catch (error) {
            console.error('❌ [DETAILS] Erro ao carregar entrada:', error);
            setError('Não foi possível carregar a entrada');
            toast.showError('Erro', 'Não foi possível carregar os detalhes da entrada');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEntry();
    }, [id]);

    const handleEdit = () => {
        if (!entry) return;
        toast.showInfo('Em breve', 'Funcionalidade de edição será implementada em breve.');
    };

    const handleDelete = async () => {
        if (!entry) return;

        try {
            await DiaryService.deleteDiaryEntry(entry.id);
            toast.showSuccess('Sucesso', 'Entrada deletada com sucesso!');
            router.back();
        } catch (error) {
            console.error('❌ [DETAILS] Erro ao deletar entrada:', error);
            toast.showError('Erro', 'Não foi possível deletar a entrada.');
        }
    };

    const getMoodLabels = (feelingsJson?: string): string[] => {
        if (!feelingsJson) return [];
        
        try {
            const feelings = JSON.parse(feelingsJson);
            
            // Se é um array, retorna como está
            if (Array.isArray(feelings)) {
                return feelings.filter(Boolean); // Remove valores falsy
            }
            
            // Se é uma string única, transforma em array
            if (typeof feelings === 'string') {
                return [feelings];
            }
            
            // Se é um objeto, pode ter diferentes estruturas
            if (typeof feelings === 'object' && feelings !== null) {
                // Se tem uma propriedade específica com array
                if (feelings.moods && Array.isArray(feelings.moods)) {
                    return feelings.moods;
                }
                // Se tem propriedades que são os próprios moods
                const moodKeys = Object.keys(feelings);
                if (moodKeys.length > 0) {
                    return moodKeys;
                }
            }
            
            return [];
        } catch (error) {
            console.warn('⚠️ [DETAILS] Erro ao processar feelings JSON:', error);
            // Fallback: tenta tratar como string simples
            return feelingsJson ? [feelingsJson] : [];
        }
    };

    return (
        <>
            <StatusBarBackground />
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.surface }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <ThemedText variant="h2">Detalhes da Entrada</ThemedText>
                    <View style={styles.headerActions}>
                        {entry && (
                            <>
                                <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                                    <Ionicons name="pencil" size={20} color={colors.text.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                                    <Ionicons name="trash" size={20} color={colors.error} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <ThemedText color="secondary" style={styles.loadingText}>
                            Carregando entrada...
                        </ThemedText>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={48} color={colors.error} />
                        <ThemedText variant="h3" color="secondary" style={styles.errorTitle}>
                            Erro ao carregar
                        </ThemedText>
                        <ThemedText color="tertiary" style={styles.errorMessage}>
                            {error}
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.retryButton, { backgroundColor: colors.primary }]}
                            onPress={loadEntry}
                        >
                            <ThemedText style={[styles.retryButtonText, { color: colors.text.inverse }]}>
                                Tentar novamente
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : entry ? (
                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header Info */}
                        <ThemedView variant="card" style={styles.headerCard}>
                            <View style={styles.titleSection}>
                                <Text style={styles.moodEmoji}>
                                    {getMoodEmoji(entry.current_mood || '')}
                                </Text>
                                <ThemedText variant="h2" style={styles.entryTitle}>
                                    {entry.title}
                                </ThemedText>
                            </View>
                            <View style={styles.metaInfo}>
                                <View style={styles.metaItem}>
                                    <Ionicons name="calendar" size={16} color={colors.text.secondary} />
                                    <ThemedText color="secondary" style={styles.metaText}>
                                        {formatDate(entry.created_at)}
                                    </ThemedText>
                                </View>
                                <View style={styles.metaItem}>
                                    <Ionicons name="time" size={16} color={colors.text.secondary} />
                                    <ThemedText color="secondary" style={styles.metaText}>
                                        {formatDateTime(entry.created_at)}
                                    </ThemedText>
                                </View>
                            </View>
                        </ThemedView>

                        {/* Event Section */}
                        {entry.event && (
                            <ThemedView variant="card" style={styles.sectionCard}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="newspaper" size={20} color={colors.text.secondary} />
                                    <ThemedText variant="h3" style={styles.sectionTitle}>
                                        O que aconteceu
                                    </ThemedText>
                                </View>
                                <ThemedText style={styles.sectionContent}>
                                    {entry.event}
                                </ThemedText>
                            </ThemedView>
                        )}

                        {/* Thoughts Section */}
                        {entry.thoughts && (
                            <ThemedView variant="card" style={styles.sectionCard}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="bulb" size={20} color={colors.text.secondary} />
                                    <ThemedText variant="h3" style={styles.sectionTitle}>
                                        Pensamentos
                                    </ThemedText>
                                </View>
                                <ThemedText style={styles.sectionContent}>
                                    {entry.thoughts}
                                </ThemedText>
                            </ThemedView>
                        )}

                        {/* Reactions Section */}
                        {entry.reactions && (
                            <ThemedView variant="card" style={styles.sectionCard}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="flash" size={20} color={colors.text.secondary} />
                                    <ThemedText variant="h3" style={styles.sectionTitle}>
                                        Como você reagiu
                                    </ThemedText>
                                </View>
                                <ThemedText style={styles.sectionContent}>
                                    {entry.reactions}
                                </ThemedText>
                            </ThemedView>
                        )}

                        {/* Alternative Section */}
                        {entry.alternative && (
                            <ThemedView variant="card" style={styles.sectionCard}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="swap-horizontal" size={20} color={colors.text.secondary} />
                                    <ThemedText variant="h3" style={styles.sectionTitle}>
                                        O que poderia fazer diferente
                                    </ThemedText>
                                </View>
                                <ThemedText style={styles.sectionContent}>
                                    {entry.alternative}
                                </ThemedText>
                            </ThemedView>
                        )}

                        {/* Emotions & Intensity */}
                        <ThemedView variant="card" style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="heart" size={20} color={colors.text.secondary} />
                                <ThemedText variant="h3" style={styles.sectionTitle}>
                                    Emoções e Intensidade
                                </ThemedText>
                            </View>
                            
                            {entry.intensity && (
                                <View style={styles.intensitySection}>
                                    <ThemedText color="secondary" style={styles.intensityLabel}>
                                        Intensidade: {entry.intensity}/10
                                    </ThemedText>
                                    <View style={styles.intensityBar}>
                                        <View 
                                            style={[
                                                styles.intensityFill, 
                                                { 
                                                    width: `${(entry.intensity / 10) * 100}%`,
                                                    backgroundColor: colors.primary 
                                                }
                                            ]} 
                                        />
                                    </View>
                                </View>
                            )}

                            {entry.feelings && (() => {
                                const emotions = getMoodLabels(entry.feelings);
                                console.log('🎭 [DETAILS] Emoções processadas:', emotions);
                                
                                if (emotions.length === 0) return null;
                                
                                return (
                                    <View style={styles.emotionsSection}>
                                        <ThemedText color="secondary" style={styles.emotionsLabel}>
                                            {emotions.length === 1 
                                                ? 'Emoção registrada:' 
                                                : 'Emoções registradas:'
                                            }
                                        </ThemedText>
                                        <View style={styles.emotionsList}>
                                            {emotions.map((mood: string, index: number) => (
                                                <View key={`${mood}-${index}`} style={[styles.emotionTag, { backgroundColor: colors.primary }]}>
                                                    <ThemedText style={[styles.emotionText, { color: colors.text.inverse }]}>
                                                        {mood}
                                                    </ThemedText>
                                                </View>
                                            ))}
                                        </View>
                                        <ThemedText color="tertiary" style={styles.emotionCount}>
                                            {emotions.length} emoção{emotions.length > 1 ? 'ões' : ''}
                                        </ThemedText>
                                    </View>
                                );
                            })()}
                        </ThemedView>
                    </ScrollView>
                ) : null}
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
    actionButton: {
        padding: 8,
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 40,
    },
    errorTitle: {
        marginTop: 16,
        marginBottom: 8,
    },
    errorMessage: {
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    scrollContent: {
        paddingBottom: 120,
        paddingTop: 16,
    },
    headerCard: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
    },
    titleSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    moodEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    entryTitle: {
        flex: 1,
    },
    metaInfo: {
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        fontSize: 14,
        textTransform: 'capitalize',
    },
    sectionCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionContent: {
        fontSize: 16,
        lineHeight: 24,
    },
    intensitySection: {
        marginBottom: 16,
    },
    intensityLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    intensityBar: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    intensityFill: {
        height: '100%',
        borderRadius: 4,
    },
    emotionsSection: {
        marginTop: 8,
    },
    emotionsLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    emotionsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    emotionTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    emotionText: {
        fontSize: 12,
        fontWeight: '500',
    },
    emotionCount: {
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});