export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          description: string;
          category_id: string;
          category_name: string;
          category_icon: string;
          category_color: string;
          date: string;
          type: "expense" | "income";
          tags: string[] | null;
          currency: string | null;
          original_amount: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          description: string;
          category_id: string;
          category_name: string;
          category_icon: string;
          category_color: string;
          date: string;
          type: "expense" | "income";
          tags?: string[] | null;
          currency?: string | null;
          original_amount?: number | null;
          receipt_image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          description?: string;
          category_id?: string;
          category_name?: string;
          category_icon?: string;
          category_color?: string;
          date?: string;
          type?: "expense" | "income";
          tags?: string[] | null;
          currency?: string | null;
          original_amount?: number | null;
          receipt_image_url?: string | null;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          base_currency: string;
          theme: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          base_currency?: string;
          theme?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          base_currency?: string;
          theme?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
