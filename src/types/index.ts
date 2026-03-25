// src/types/index.ts

export type Drug = {
  id: string;
  drug_code: string;
  trade_name: string | null;
  generic_name: string | null;
  account: string | null;
  price_opd: number;
  category: string | null;
  is_active: boolean;
  remarks: string | null;
  decommissioned_at: string | null;
};

export type DrugFormData = {
  id?: string;
  drug_code: string;
  trade_name: string | null;
  generic_name: string | null;
  account: string | null;
  price_opd: number;
  category: string | null;
  is_active: boolean;
  remarks: string | null;
  decommissioned_at?: string | null;
};

export type DrugStatus = 'active' | 'decommissioned';

export type GetDrugsParams = {
  page?: number;
  pageSize?: number;
  status?: DrugStatus;
  category?: string;
  searchTerm?: string;
};

export type GetDrugsResult = {
  data: Drug[];
  count: number | null;
};

export type ActionResult = { success: true } | { success: false; message: string };

export type UpdateStatusParams = {
  isActive: boolean;
  remarks?: string | null;
};

export type ToastType = 'info' | 'success' | 'error';

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

export type CsvRow = {
  'รหัสเวชภัณฑ์'?: string;
  'ชื่อเวชภัณฑ์'?: string;
  'Generic name'?: string;
  'บัญชี'?: string;
  'ราคา (OPD)'?: string;
  'Category'?: string;
};
