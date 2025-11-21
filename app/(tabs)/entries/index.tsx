import { Redirect } from 'expo-router';

export default function EntriesIndex() {
  return <Redirect href="/(tabs)/entries/entries" />;
}