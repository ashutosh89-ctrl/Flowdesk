import { read, update } from './dataService';
import { User } from '../types';

export async function getUserSettings(userId: string): Promise<User | null> {
  return await read<User>('users', userId);
}

export async function updateUserSettings(userId: string, data: Partial<User>): Promise<User> {
  return await update<User>('users', userId, data);
}
