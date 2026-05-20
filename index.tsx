import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { db } from '@/lib/db';
import { useRouter } from 'expo-router';
import { id } from '@instantdb/react-native';

type Task = {
  id: string;
  emoji?: string;
  title: string;
  description?: string;
  status: boolean;
  createdAt: number;
};

export default function TasksList() {
  const router = useRouter();
  const query = db.useQuery({ tasks: {} });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync query results to state
  useEffect(() => {
    if (query.error) {
      setError(query.error.message);
      setLoading(false);
    } else if (query.data) {
      setTasks((query.data.tasks as Task[]) ?? []);
      setLoading(false);
    }
    console.log('Query result:', query);
    if (query.error) console.error('Query error:', query.error);
    else console.log('Query data:', query.data);
  }, [query]);

  const toggleTask = async (task: Task) => {
    try {
      await db.transact(
        db.tx.tasks[task.id].update({
          status: !task.status,
        })
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const deleteTask = async (task: Task) => {
    try {
      await db.transact(db.tx.tasks[task.id].delete());
      // Optimistically remove from local state
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      console.error('Delete task error:', err);
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  if (loading) {
    console.log('Loading state - returning loading view');
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    console.log('Error state - returning error view');
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            {/* Toggle status when main area pressed */}
            <TouchableOpacity
              style={styles.taskContent}
              onPress={() => toggleTask(item)}
            >
              <Text style={styles.emoji}>{item.emoji || '📝'}</Text>
              <View style={styles.taskDetails}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                {item.description ? (
                  <Text style={styles.taskDescription}>{item.description}</Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.checkbox,
                  item.status && styles.checkboxChecked,
                ]}
              >
                {item.status ? (
                  <Text style={styles.checkboxText}>✓</Text>
                ) : null}
              </View>
            </TouchableOpacity>
            {/* Edit button */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push(`/(tasks)/edit-task?id=${item.id}`)}
            >
              <Text style={styles.editButtonText}>✏️</Text>
            </TouchableOpacity>
            {/* Delete button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTask(item)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks yet. Add one below!</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/(tasks)/add-task')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 20,
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emoji: {
    fontSize: 24,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkboxText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 20,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 32,
    lineHeight: 56,
    fontWeight: 'bold',
  },
});
