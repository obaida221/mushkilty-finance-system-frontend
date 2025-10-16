import { useState, useEffect } from 'react';
import usersAPI from '../api/usersAPI';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add a new user
  const addUser = async (userData: CreateUserRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await usersAPI.create(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing user
  const updateUser = async (id: number, userData: UpdateUserRequest) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await usersAPI.update(id, userData);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const deleteUser = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await usersAPI.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Filter users by role
  const getUsersByRole = (role: string) => {
    if (!users) return [];
    if (!role) return [];
    if (role === 'all') return users;
    if (role === 'none') return users.filter(user => !user.role);
    if (role === 'unassigned') return users.filter(user => user.role === null || user.role === undefined);
    return users.filter(user => {if (user.role) user.role.name === role});
  };

  // Get user by ID
  const getUserById = (id: number) => {
    return users.find(user => user.id === id);
  };

  // Initialize data fetching
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    getUsersByRole,
    getUserById
  };
};
