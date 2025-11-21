import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getMoodEmoji } from '../../constants/moodOptions';
import { useAuth } from '../../contexts/AuthContext';
import { useDiary } from '../../contexts/DiaryContext';
import { useTheme } from '../../hooks';
import { ThemedText, ThemedView } from '../ui';

export function RecentEntryCard() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const { lastEntry, loading, isActive } = useDiary();

    const formatDate = (timestamp: number) => {
        // Se o timestamp estiver em segundos, converter para millisegundos
        const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: '2-digit'
        });
    };

    const handleViewAll = () => {
        // Navegar para tela de histórico
        router.push('/(tabs)/entries/entries');
    };

    const handleEntryPress = () => {
        if (lastEntry) {
            // Navegar para detalhes da entrada ou edição
            // router.push(`/entry/${lastEntry.id}`);
        }
    };

    if (loading) {
        return (
            <>
                <View style={styles.sectionHeader}>
                    <ThemedText variant="h3">Recém adicionado</ThemedText>
                    <TouchableOpacity onPress={handleViewAll}>
                        <ThemedText color="secondary">Ver tudo</ThemedText>
                    </TouchableOpacity>
                </View>
                <ThemedView variant="card" style={styles.entryCard}>
                    <ThemedText color="secondary">Carregando...</ThemedText>
                </ThemedView>
            </>
        );
    }

    if (!lastEntry) {
        return (
            <>
                <View style={styles.sectionHeader}>
                    <ThemedText variant="h3">Recém adicionado</ThemedText>
                    <TouchableOpacity onPress={handleViewAll}>
                        <ThemedText color="secondary">Ver tudo</ThemedText>
                    </TouchableOpacity>
                </View>
                <ThemedView variant="card" style={styles.entryCard}>
                    <ThemedText color="secondary">Nenhuma entrada encontrada</ThemedText>
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => router.push('/(tabs)/entries/add-entry')}
                    >
                        <ThemedText color="primary">Criar primeira entrada</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </>
        );
    }

    const entryEmoji = getMoodEmoji(lastEntry.current_mood || '');

    return (
        <>
            <View style={styles.sectionHeader}>
                <View style={styles.titleWithStatus}>
                    <ThemedText variant="h3">Recém adicionado</ThemedText>
                    <View style={[styles.statusDot, { 
                        backgroundColor: isActive ? '#4CAF50' : '#FF5722' 
                    }]} />
                </View>
                <TouchableOpacity onPress={handleViewAll}>
                    <ThemedText color="secondary">Ver tudo</ThemedText>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleEntryPress}>
                <ThemedView variant="card" style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                        <Text style={styles.smiley}>{entryEmoji}</Text>
                        <TouchableOpacity style={styles.moreIcon}>
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
                            {formatDate(lastEntry.created_at)}
                        </ThemedText>
                    </View>
                    <ThemedText variant="h3" style={styles.entryTitle}>
                        {lastEntry.title}
                    </ThemedText>
                    {lastEntry.thoughts && (
                        <ThemedText color="tertiary" style={styles.entryContent} numberOfLines={2}>
                            {lastEntry.thoughts}
                        </ThemedText>
                    )}
                </ThemedView>
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
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
    addButton: {
        marginTop: 12,
        padding: 8,
        alignItems: 'center',
    },
    titleWithStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});