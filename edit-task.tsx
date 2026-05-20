import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, Alert } from 'react-native';
import { db } from '@/lib/db';
import { useRouter, useSearchParams } from 'expo-router';
import { id as genId } from '@instantdb/react-native'; // not used for creation but keep import consistency

// Re‑use the same Task shape as in the list screen
type Task = {
  id: string;
  emoji?: string;
  title: string;
  description?: string;
  status: boolean;
  createdAt: number;
};

export default function EditTask() {
  const router = useRouter();
  const { id } = useSearchParams<{ id: string }>(); // task id from query string

  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt'>>({
    emoji: '',
    title: '',
    description: '',
    status: false,
  });
  const [loading, setLoading] = useState(true);

  // Load the task once query data is available
  useEffect(() => {
    if (!id) return;
    const unsub = db.subscribeQuery({ tasks: {} }, (result) => {
      if (result.error) {
        Alert.alert('Error', 'Failed to load task');
        setLoading(false);
        return;
      }
      const tasks = (result.data?.tasks as Task[]) ?? [];
      const task = tasks.find((t) => t.id === id);
      if (task) {
        setFormData({
          emoji: task.emoji ?? '',
          title: task.title,
          description: task.description ?? '',
          status: task.status,
        });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    try {
      await db.transact(
        db.tx.tasks[id].update({
          ...formData,
        })
      );
      router.back();
    } catch (e) {
      console.error('Update task error:', e);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const goBack = () => {
    Keyboard.dismiss();
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading task…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Task</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Emoji (optional)</Text>
          <TextInput
            style={styles.emojiInput}
            placeholder="📝"
            value={formData.emoji}
            onChangeText={(text) => setFormData({ ...formData, emoji: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="What needs to be done?"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Add details..."
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backButton: { marginRight: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  backButtonText: { fontSize: 20, color: '#333' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  formContainer: { gap: 24 },
  inputGroup: { gap: 8 },
  label: { fontSize: 16, fontWeight: '500', color: '#333' },
  emojiInput: { fontSize: 40, textAlign: 'center', borderWidth: 2, borderColor: '#e0e0e0', borderRadius: 12, paddingVertical: 16, minHeight: 60 },
  titleInput: { fontSize: 16, borderWidth: 2, borderColor: '#e0e0e0', borderRadius: 12, padding: 16, minHeight: 48 },
  descriptionInput: { fontSize: 16, borderWidth: 2, borderColor: '#e0e0e0', borderRadius: 12, padding: 16, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  loadingText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
});
