import type {
  Drug,
  DrugFormData,
  DrugStatus,
  GetDrugsParams,
  GetDrugsResult,
  UpdateStatusParams,
} from '../types';
import { supabase } from './supabase-client';

export const drugService = {
  /**
   * ดึงข้อมูลรายการยาแบบ Pagination และ Filtering
   */
  async getDrugs({
    page = 1,
    pageSize = 20,
    status = 'active' as DrugStatus,
    category = 'all',
    searchTerm = '',
  }: GetDrugsParams = {}): Promise<GetDrugsResult> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // เริ่มสร้าง Query — ใช้ const chain แทน let reassignment เพื่อความถูกต้องด้านประเภท
      const base = supabase.from('drugs').select('*', { count: 'exact' });

      // Logic แยกสถานะ (Active vs Decommissioned)
      const withStatus
        = status === 'decommissioned'
          ? base
              .eq('is_active', false)
              .not('remarks', 'is', null)
              .order('decommissioned_at', { ascending: false })
          : base.eq('is_active', true).order('drug_code', { ascending: true });

      // Logic กรองตามหมวดหมู่
      const withCategory
        = category && category !== 'all' ? withStatus.eq('category', category) : withStatus;

      // Logic ค้นหา (Search)
      const term = `%${searchTerm.trim()}%`;
      const withSearch = searchTerm
        ? withCategory.or(
            `trade_name.ilike.${term},generic_name.ilike.${term},drug_code.ilike.${term},remarks.ilike.${term}`,
          )
        : withCategory;

      // Pagination + Execute
      const { data, count, error } = await withSearch.range(from, to);

      if (error)
        throw error;

      // FIX: Supabase client without generated DB types returns `any` for query results.
      // Runtime guarantee: the `drugs` table schema in Supabase matches the Drug type definition.
      return { data: (data ?? []) as Drug[], count };
    }
    catch (error) {
      console.error('DrugService Error [getDrugs]:', error);
      throw error;
    }
  },

  /**
   * ดึงหมวดหมู่ยาที่ไม่ซ้ำกัน (สำหรับ Dropdown filter)
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase.rpc('get_unique_categories', {
        status_filter: 'active',
      });
      if (error)
        throw error;

      // FIX: RPC without generated DB types returns `any`.
      // Runtime guarantee: the procedure returns Array<{ category: string }>.
      return (data as Array<{ category: string }>).map(item => item.category);
    }
    catch (error) {
      console.error('DrugService Error [getCategories]:', error);
      throw error;
    }
  },

  /**
   * เพิ่ม หรือ แก้ไขข้อมูลยา (รองรับทั้งรายการเดียวและ Array)
   */
  async upsertDrugs(payload: DrugFormData | DrugFormData[]): Promise<true> {
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

  /**
   * เปลี่ยนสถานะยา (Decommission / Recommission)
   */
  async updateStatus(id: string, { isActive, remarks = null }: UpdateStatusParams): Promise<true> {
    try {
      const updatePayload = {
        is_active: isActive,
        remarks,
        decommissioned_at: isActive ? null : new Date().toISOString(), // Logic เวลาอัตโนมัติ
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
