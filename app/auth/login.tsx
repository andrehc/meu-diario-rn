import LoginComponent from '@/components/auth/LoginComponent';
import { ThemedView } from '@/components/themed-view';

export default function Login() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <LoginComponent />
    </ThemedView>
  );
}