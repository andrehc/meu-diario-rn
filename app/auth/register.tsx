import RegisterComponent from '@/components/auth/RegisterComponent';
import { ThemedView } from '@/components/themed-view';

export default function Register() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <RegisterComponent />
    </ThemedView>
  );
}