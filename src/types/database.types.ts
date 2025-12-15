export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      drugs: {
        Row: {
          id: string;
          drug_code: string | null;
          trade_name: string | null;
          generic_name: string | null;
          account: string | null;
          price_opd: number | null;
          category: string | null;
          is_active: boolean;
          remarks: string | null;
          decommissioned_at: string | null;
        };
        Insert: {
          id?: string;
          drug_code?: string | null;
          trade_name?: string | null;
          generic_name?: string | null;
          account?: string | null;
          price_opd?: number | null;
          category?: string | null;
          is_active?: boolean;
          remarks?: string | null;
          decommissioned_at?: string | null;
        };
        Update: {
          id?: string;
          drug_code?: string | null;
          trade_name?: string | null;
          generic_name?: string | null;
          account?: string | null;
          price_opd?: number | null;
          category?: string | null;
          is_active?: boolean;
          remarks?: string | null;
          decommissioned_at?: string | null;
        };
      };
      profiles_drugcupsabot: {
        Row: {
          id: string;
          role: 'admin' | 'viewer' | null;
        };
        Insert: {
          id: string;
          role?: 'admin' | 'viewer' | null;
        };
        Update: {
          id?: string;
          role?: 'admin' | 'viewer' | null;
        };
      };
    };
  };
};

// Convenience types
export type Drug = Database['public']['Tables']['drugs']['Row'];
export type DrugInsert = Database['public']['Tables']['drugs']['Insert'];
export type DrugUpdate = Database['public']['Tables']['drugs']['Update'];
