export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      etudiants: {
        Row: {
          created_at: string
          date_inscription: string
          date_naissance: string | null
          filiere_id: string | null
          id: string
          matricule: string
          niveau: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date_inscription?: string
          date_naissance?: string | null
          filiere_id?: string | null
          id?: string
          matricule: string
          niveau?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date_inscription?: string
          date_naissance?: string | null
          filiere_id?: string | null
          id?: string
          matricule?: string
          niveau?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "etudiants_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
        ]
      }
      filieres: {
        Row: {
          code: string
          created_at: string
          description: string | null
          duree_annees: number
          id: string
          nom: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          duree_annees?: number
          id?: string
          nom: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          duree_annees?: number
          id?: string
          nom?: string
          updated_at?: string
        }
        Relationships: []
      }
      inscriptions: {
        Row: {
          annee_academique: string
          created_at: string
          etudiant_id: string
          id: string
          statut: Database["public"]["Enums"]["inscription_statut"]
        }
        Insert: {
          annee_academique: string
          created_at?: string
          etudiant_id: string
          id?: string
          statut?: Database["public"]["Enums"]["inscription_statut"]
        }
        Update: {
          annee_academique?: string
          created_at?: string
          etudiant_id?: string
          id?: string
          statut?: Database["public"]["Enums"]["inscription_statut"]
        }
        Relationships: [
          {
            foreignKeyName: "inscriptions_etudiant_id_fkey"
            columns: ["etudiant_id"]
            isOneToOne: false
            referencedRelation: "etudiants"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          code: string
          coefficient: number
          created_at: string
          enseignant_id: string | null
          filiere_id: string | null
          id: string
          nom: string
          semestre: number
          updated_at: string
        }
        Insert: {
          code: string
          coefficient?: number
          created_at?: string
          enseignant_id?: string | null
          filiere_id?: string | null
          id?: string
          nom: string
          semestre?: number
          updated_at?: string
        }
        Update: {
          code?: string
          coefficient?: number
          created_at?: string
          enseignant_id?: string | null
          filiere_id?: string | null
          id?: string
          nom?: string
          semestre?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          commentaire: string | null
          created_at: string
          date_evaluation: string
          etudiant_id: string
          id: string
          module_id: string
          note: number
          saisie_par: string | null
          type: Database["public"]["Enums"]["note_type"]
          updated_at: string
        }
        Insert: {
          commentaire?: string | null
          created_at?: string
          date_evaluation?: string
          etudiant_id: string
          id?: string
          module_id: string
          note: number
          saisie_par?: string | null
          type?: Database["public"]["Enums"]["note_type"]
          updated_at?: string
        }
        Update: {
          commentaire?: string | null
          created_at?: string
          date_evaluation?: string
          etudiant_id?: string
          id?: string
          module_id?: string
          note?: number
          saisie_par?: string | null
          type?: Database["public"]["Enums"]["note_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_etudiant_id_fkey"
            columns: ["etudiant_id"]
            isOneToOne: false
            referencedRelation: "etudiants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      presences: {
        Row: {
          commentaire: string | null
          created_at: string
          date_seance: string
          etudiant_id: string
          id: string
          module_id: string
          saisie_par: string | null
          statut: Database["public"]["Enums"]["presence_statut"]
        }
        Insert: {
          commentaire?: string | null
          created_at?: string
          date_seance?: string
          etudiant_id: string
          id?: string
          module_id: string
          saisie_par?: string | null
          statut?: Database["public"]["Enums"]["presence_statut"]
        }
        Update: {
          commentaire?: string | null
          created_at?: string
          date_seance?: string
          etudiant_id?: string
          id?: string
          module_id?: string
          saisie_par?: string | null
          statut?: Database["public"]["Enums"]["presence_statut"]
        }
        Relationships: [
          {
            foreignKeyName: "presences_etudiant_id_fkey"
            columns: ["etudiant_id"]
            isOneToOne: false
            referencedRelation: "etudiants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presences_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cin: string | null
          created_at: string
          email: string | null
          id: string
          nom: string
          prenom: string
          telephone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cin?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string
          prenom?: string
          telephone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cin?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string
          prenom?: string
          telephone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "enseignant" | "etudiant"
      inscription_statut: "active" | "suspendue" | "terminee"
      note_type: "controle_continu" | "examen" | "tp" | "projet"
      presence_statut: "present" | "absent" | "retard" | "justifie"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "enseignant", "etudiant"],
      inscription_statut: ["active", "suspendue", "terminee"],
      note_type: ["controle_continu", "examen", "tp", "projet"],
      presence_statut: ["present", "absent", "retard", "justifie"],
    },
  },
} as const
