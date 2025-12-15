import type { Drug, DrugInsert } from '@/types/database.types';

import { supabase } from '@/supabaseClient';

type GetDrugsParams = {
  page?: number;
  pageSize?: number;
  status?: 'active' | 'decommissioned';
  category?: string;
  searchTerm?: string;
};

type GetDrugsResponse = {
  data: Drug[];
  count: number;
};

export const drugService = {
  async getDrugs({
    page = 1,
    pageSize = 20,
    status = 'active',
    category = 'all',
    searchTerm = '',
  }: GetDrugsParams): Promise<GetDrugsResponse> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from('drugs').select('*', { count: 'exact' });

      if (status === 'decommissioned') {
        query = query
          .eq('is_active', false)
          .not('remarks', 'is', null)
          .order('decommissioned_at', { ascending: false });
      }
      else {
        query = query.eq('is_active', true).order('drug_code', { ascending: true });
      }

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (searchTerm) {
        const term = `%${searchTerm.trim()}%`;
        // Supabase Postgrest Filters typing needs raw string for dynamic OR
        query = query.or(
          `trade_name.ilike.${term},generic_name.ilike.${term},drug_code.ilike.${term},remarks.ilike.${term}`,
        );
      }

      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error)
        throw error;

      return { data: data || [], count: count || 0 };
    }
    catch (error) {
      console.error('DrugService Error [getDrugs]:', error);
      throw error;
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      // RPC call needs generic type argument if RPC is complex, or standard return inference
      const { data, error } = await supabase.rpc('get_unique_categories', {
        status_filter: 'active',
      });

      if (error)
        throw error;

      // Assumes RPC returns { category: string }[]
      return (data as any[]).map(item => item.category);
    }
    catch (error) {
      console.error('DrugService Error [getCategories]:', error);
      return [];
    }
  },

  async upsertDrugs(payload: DrugInsert | DrugInsert[]): Promise<boolean> {
    try {
      const { error } = await supabase.from('drugs').upsert(payload, {
        onConflict: 'drug_code',
      });

      if (error)
        throw error;
      return true;
    }
    catch (error) {
      console.error('DrugService Error [upsertDrugs]:', error);
      throw error;
    }
  },

  async updateStatus(
    id: string,
    { isActive, remarks = null }: { isActive: boolean; remarks?: string | null },
  ): Promise<boolean> {
    try {
      const updatePayload = {
        is_active: isActive,
        remarks,
        decommissioned_at: isActive ? null : new Date().toISOString(),
      };

      const { error } = await supabase.from('drugs').update(updatePayload).eq('id', id);

      if (error)
        throw error;
      return true;
    }
    catch (error) {
      console.error('DrugService Error [updateStatus]:', error);
      throw error;
    }
  },
};
