import { supabase } from '../utils/supabase';
import { Tables, TablesInsert, TablesUpdate } from '../types/database.types';

export type Signal = Tables<'signals'>;
export type SignalInsert = TablesInsert<'signals'>;
export type SignalUpdate = TablesUpdate<'signals'>;

export const signalService = {
  async createSignal(signalData: Omit<SignalInsert, 'user_id'>): Promise<Signal | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('User is not authenticated.');
    }

    const payload: SignalInsert = {
      ...signalData,
      user_id: session.user.id,
    };
    
    const { data, error } = await supabase
      .from('signals')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating signal:', error);
      throw error;
    }
    return data;
  },

  async updateSignal(id: string, updates: SignalUpdate): Promise<Signal | null> {
    const { data, error } = await supabase
      .from('signals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating signal:', error);
      throw error;
    }
    return data;
  },

  async getAllSignals(): Promise<Signal[]> {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching signals:', error);
      throw error;
    }
    return data || [];
  },

  async getSignalById(id: string): Promise<Signal | null> {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching signal by ID:', error);
      // Don't throw if it's just "no rows found"
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async deleteSignal(id: string): Promise<void> {
    const { error } = await supabase
      .from('signals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting signal:', error);
      throw error;
    }
  },
};
