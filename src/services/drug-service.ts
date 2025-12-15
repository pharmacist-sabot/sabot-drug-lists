import type { Drug, DrugInsert, DrugUpdate } from '@/types/database.types';

import { supabase } from '@/supabase-client';

// --- Interfaces ---

export type GetDrugsParams = {
  page?: number;
  pageSize?: number;
  status?: 'active' | 'decommissioned';
  category?: string;
  searchTerm?: string;
};

export type GetDrugsResponse = {
  data: Drug[];
  count: number;
};

// --- Service ---

export const drugService = {
  /**
   * ดึงข้อมูลรายการยาแบบ Pagination และ Filtering
   */
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
        query = query.or(
          `trade_name.ilike.${term},generic_name.ilike.${term},drug_code.ilike.${term},remarks.ilike.${term}`,
        );
      }

      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        data: data || [],
        count: count || 0,
      };
    }
    catch (error) {
      console.error('DrugService Error [getDrugs]:', error);
      throw error;
    }
  },

  /**
   * ดึงหมวดหมู่ยาที่ไม่ซ้ำกัน
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await (supabase.rpc as any)('get_unique_categories', {
        status_filter: 'active',
      });

      if (error) {
        throw new Error(error.message);
      }

      if (Array.isArray(data)) {
        return data.map((item: any) => item.category);
      }

      return [];
    }
    catch (error) {
      console.error('DrugService Error [getCategories]:', error);
      return [];
    }
  },

  /**
   * เพิ่ม หรือ แก้ไขข้อมูลยา
   */
  async upsertDrugs(payload: DrugInsert | DrugInsert[]): Promise<boolean> {
    try {
      const payloadArray = Array.isArray(payload) ? payload : [payload];

      const { error } = await supabase.from('drugs').upsert(payloadArray as any, {
        onConflict: 'drug_code',
      });

      if (error) {
        throw new Error(error.message);
      }
      return true;
    }
    catch (error) {
      console.error('DrugService Error [upsertDrugs]:', error);
      throw error;
    }
  },

  /**
   * เปลี่ยนสถานะยา (Decommission / Recommission)
   */
  async updateStatus(
    id: string,
    { isActive, remarks = null }: { isActive: boolean; remarks?: string | null },
  ): Promise<boolean> {
    try {
      const updatePayload: DrugUpdate = {
        is_active: isActive,
        remarks: isActive ? null : remarks,
        decommissioned_at: isActive ? null : new Date().toISOString(),
      };

      const { error } = await (supabase.from('drugs') as any)
        .update(updatePayload)
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
      return true;
    }
    catch (error) {
      console.error('DrugService Error [updateStatus]:', error);
      throw error;
    }
  },
};
