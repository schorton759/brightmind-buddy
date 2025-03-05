
import { Session, User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  username: string;
  user_type: 'child' | 'parent';
  age_group: '8-10' | '10-12' | '13-15' | '15+' | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string, userType: 'child' | 'parent', ageGroup?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => Promise<Profile | null>;
};
