import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, Alert } from 'react-native';
import { db } from '@/lib/db';
import { useRouter } from 'expo-router';
import { id } from '@instantdb/react-native';

type NewTask = {
  emoji: string;
  title: string;
  description?: string;
};

export default function AddTask() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewTask>({
    emoji: '',
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setLoading(true);
    try {
      const taskId = id();
      await db.transact(
        db.tx.tasks[taskId].create({
          ...formData,
          status: false,
          createdAt: new Date(),
        })
      );

      // Clear form and navigate back
      setFormData({ emoji: '', title: '', description: '' });
      Keyboard.dismiss();
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    Keyboard.dismiss();
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add New Task</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Emoji (optional)</Text>
          <TextInput
            style={styles.emojiInput}
            placeholder="📝"
            value={formData.emoji}
            onChangeText={(text) => setFormData({...formData, emoji: text})}
                      />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="What needs to be done?"
            value={formData.title}
            onChangeText={(text) => setFormData({...formData, title: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Add details..."
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Adding...' : 'Add Task'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  emojiInput: {
    fontSize: 40,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 16,
    minHeight: 60,
  },
  titleInput: {
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    minHeight: 48,
  },
  descriptionInput: {
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
