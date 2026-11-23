import { prisma } from "@/lib/prisma";
import { RuleType } from "@prisma/client";

export class RuleRepository {
  async getActiveRules(userId?: string) {
    return prisma.styleRule.findMany({
      where: {
        isActive: true,
        OR: [{ userId: null }, { userId }],
      },
      orderBy: {
        priority: "desc",
      },
    });
  }

  async getRulesByType(type: RuleType, userId?: string) {
    return prisma.styleRule.findMany({
      where: {
        ruleType: type,
        isActive: true,
        OR: [{ userId: null }, { userId }],
      },
    });
  }
}

export const ruleRepository = new RuleRepository();
