import { prisma } from "@/lib/prisma";

export class AuthRepository {
  /**
   * Synchronizes or retrieves the AppUser record matching the Supabase Auth UUID.
   */
  async ensureAppUser(supabaseUserId: string, email: string) {
    return prisma.appUser.upsert({
      where: { id: supabaseUserId },
      update: { email },
      create: {
        id: supabaseUserId,
        email,
      },
    });
  }

  async getAppUserById(id: string) {
    return prisma.appUser.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });
  }
}

export const authRepository = new AuthRepository();
