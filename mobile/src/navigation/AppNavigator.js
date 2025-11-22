import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ExpensesListScreen from '../screens/ExpensesListScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Expense Summary' }}
      />
      <Stack.Screen 
        name="ExpensesList" 
        component={ExpensesListScreen}
        options={{ title: 'My Expenses' }}
      />
      <Stack.Screen 
        name="AddExpense" 
        component={AddExpenseScreen}
        options={{ title: 'Add Expense' }}
      />
      <Stack.Screen 
        name="EditExpense" 
        component={EditExpenseScreen}
        options={{ title: 'Edit Expense' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;

