
import { Session, User } from '@supabase/supabase-js';

export type UserType = 'child' | 'parent';
export type AgeGroup = '5-8' | '9-12' | '13-16';

export interface Profile {
  id: string;
  username: string;
  user_type: UserType;
  age_group: AgeGroup | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string, userType: UserType, ageGroup?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  createChildCredentials?: (childId: string, username: string, ageGroup?: string | null) => Promise<any>;
}
