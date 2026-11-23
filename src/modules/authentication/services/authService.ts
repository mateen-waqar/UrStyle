import { authRepository, AuthRepository } from "../repositories/authRepository";
import { LoginInput, RegisterInput } from "../validations";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  async signIn(input: LoginInput) {
    const supabase = createServerSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) throw error;
    if (data.user) {
      await this.repo.ensureAppUser(data.user.id, data.user.email!);
    }
    return data;
  }

  async signUp(input: RegisterInput) {
    const supabase = createServerSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          display_name: input.displayName,
        },
      },
    });

    if (error) throw error;
    if (data.user) {
      await this.repo.ensureAppUser(data.user.id, data.user.email!);
    }
    return data;
  }

  async signOut() {
    const supabase = createServerSupabase();
    return supabase.auth.signOut();
  }

  async getCurrentUser() {
    const supabase = createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return this.repo.getAppUserById(user.id);
  }
}

export const authService = new AuthService();
