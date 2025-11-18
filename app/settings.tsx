import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBarBackground from '@/components/ui/StatusBarBackground';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import BottomNavigation from '@/components/ui/BottomNavigation';
import GlobalStyles, { CommonStyles } from '@/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Tipo para os itens de configuração
interface SettingItem {
    title: string;
    icon: string;
}

// Tipo para as seções
interface Section {
    title: string;
    items: SettingItem[];
}

// Dados da tela de configurações
const settingsData: Section[] = [
    {
        title: 'Conta',
        items: [
            { title: 'Detalhes pessoais', icon: 'person' },
        ],
    },
    {
        title: 'Permissões',
        items: [
            { title: 'Notificações', icon: 'notifications' },
            { title: 'Configurações de localização', icon: 'location' },
        ],
    },
    {
        title: 'Segurança',
        items: [
            { title: 'PIN', icon: 'lock-closed' },
        ],
    },
    {
        title: 'Other',
        items: [            
            { title: 'Logout', icon: 'log-out' },
        ],
    },
];

// Componente principal
const SettingsScreen = () => {
    return (
        <>
            <StatusBarBackground />
            <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                {settingsData.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={[styles.sectionCard, sectionIndex === 0 && { marginTop: 20 }]}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        {section.items.map((item, itemIndex) => (
                            <TouchableOpacity
                                key={itemIndex}
                                style={[styles.settingItem, itemIndex !== 0 && styles.settingItemDivider]}
                            >
                                <Text style={styles.settingText}>{item.title}</Text>
                                <Ionicons name={item.icon as any} size={24} color={GlobalStyles.colors.primary} />
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </ScrollView>
            <BottomNavigation currentScreen="settings" />
        </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalStyles.colors.background,
    },
    content: {
        paddingHorizontal: GlobalStyles.spacing.l,
        paddingTop: GlobalStyles.spacing.s,
    },
    sectionCard: {
        backgroundColor: GlobalStyles.colors.cardBackground,
        borderRadius: GlobalStyles.borders.radius,
        padding: GlobalStyles.spacing.l,
        marginBottom: GlobalStyles.spacing.l,
    },
    sectionTitle: {
        fontSize: GlobalStyles.fonts.sizes.small,
        color: GlobalStyles.colors.textSecondary,
        marginBottom: GlobalStyles.spacing.m,
        fontWeight: '500',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: GlobalStyles.spacing.s,
        paddingHorizontal: GlobalStyles.spacing.xs,
    },
    settingItemDivider: {
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        marginTop: GlobalStyles.spacing.s,
    },
    settingText: {
        fontSize: GlobalStyles.fonts.sizes.medium,
        color: GlobalStyles.colors.textPrimary,
    },
});

export default SettingsScreen;