// src/services/drugService.js
import { supabase } from '../supabaseClient';

export const drugService = {
  /**
   * ดึงข้อมูลรายการยาแบบ Pagination และ Filtering
   * @param {Object} params - { page, pageSize, status, category, searchTerm }
   */
  async getDrugs({
    page = 1,
    pageSize = 20,
    status = 'active',
    category = 'all',
    searchTerm = '',
  }) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // เริ่มสร้าง Query
      let query = supabase.from('drugs').select('*', { count: 'exact' });

      // Logic แยกสถานะ (Active vs Decommissioned)
      if (status === 'decommissioned') {
        query = query
          .eq('is_active', false)
          .not('remarks', 'is', null)
          .order('decommissioned_at', { ascending: false });
      } else {
        query = query.eq('is_active', true).order('drug_code', { ascending: true });
      }

      // Logic กรองตามหมวดหมู่
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      // Logic ค้นหา (Search)
      if (searchTerm) {
        const term = `%${searchTerm.trim()}%`;
        query = query.or(
          `trade_name.ilike.${term},generic_name.ilike.${term},drug_code.ilike.${term},remarks.ilike.${term}`,
        );
      }

      // Pagination
      query = query.range(from, to);

      // Execute Query
      const { data, count, error } = await query;

      if (error) throw error;

      return { data, count };
    } catch (error) {
      console.error('DrugService Error [getDrugs]:', error);
      throw error;
    }
  },

  /**
   * ดึงหมวดหมู่ยาที่ไม่ซ้ำกัน (สำหรับ Dropdown filter)
   */
  async getCategories() {
    try {
      const { data, error } = await supabase.rpc('get_unique_categories', {
        status_filter: 'active',
      });
      if (error) throw error;
      return data.map((item) => item.category);
    } catch (error) {
      console.error('DrugService Error [getCategories]:', error);
      throw error; // ให้ Store ตัดสินใจว่าจะทำอย่างไรกับ error หรือจะ return [] ก็ได้
    }
  },

  /**
   * เพิ่ม หรือ แก้ไขข้อมูลยา (รองรับทั้งรายการเดียวและ Array)
   * @param {Object|Array} payload - ข้อมูลยา
   */
  async upsertDrugs(payload) {
    try {
      // upsert รองรับทั้ง object เดียว และ array ของ objects
      const { error } = await supabase.from('drugs').upsert(payload, {
        onConflict: 'drug_code',
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('DrugService Error [upsertDrugs]:', error);
      throw error;
    }
  },

  /**
   * เปลี่ยนสถานะยา (Decommission / Recommission)
   * @param {String} id - UUID ของยา
   * @param {Object} statusData - { isActive: boolean, remarks: string|null }
   */
  async updateStatus(id, { isActive, remarks = null }) {
    try {
      const updatePayload = {
        is_active: isActive,
        remarks: remarks,
        decommissioned_at: isActive ? null : new Date().toISOString(), // Logic เวลาอัตโนมัติ
      };

      const { error } = await supabase.from('drugs').update(updatePayload).eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('DrugService Error [updateStatus]:', error);
      throw error;
    }
  },
};
