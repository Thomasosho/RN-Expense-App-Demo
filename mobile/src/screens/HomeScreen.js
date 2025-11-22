import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const HomeScreen = ({ navigation }) => {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();

  // Get the summary of expenses grouped by category
  const fetchSummary = async () => {
    try {
      const response = await api.get('/expenses/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      // If token expired, log them out
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        logout();
      } else {
        Alert.alert('Error', 'Failed to load summary');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load summary when screen first appears
  useEffect(() => {
    fetchSummary();
  }, []);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  // Calculate total from all categories
  const categories = Object.keys(summary);
  const total = Object.values(summary).reduce((sum, amount) => sum + amount, 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Expense Summary</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Spending</Text>
            <Text style={styles.totalAmount}>
              ${total.toFixed(2)}
            </Text>
          </View>

          {categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No expenses yet</Text>
              <Text style={styles.emptySubtext}>
                Start tracking your expenses!
              </Text>
            </View>
          ) : (
            <View style={styles.categoriesContainer}>
              <Text style={styles.sectionTitle}>By Category</Text>
              {categories.map((category) => (
                <View key={category} style={styles.categoryCard}>
                  <Text style={styles.categoryName}>{category}</Text>
                  <Text style={styles.categoryAmount}>
                    ${summary[category].toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('ExpensesList')}
            >
              <Text style={styles.actionButtonText}>View All Expenses</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => navigation.navigate('AddExpense')}
            >
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                Add Expense
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#6200ee',
    fontSize: 14,
  },
  loader: {
    marginTop: 50,
  },
  totalCard: {
    backgroundColor: '#6200ee',
    margin: 20,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  totalAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  categoriesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  categoryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  actionsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  primaryButton: {
    backgroundColor: '#6200ee',
    borderWidth: 0,
  },
  actionButtonText: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
});

export default HomeScreen;

