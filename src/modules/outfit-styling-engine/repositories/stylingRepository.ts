import { prisma } from "@/lib/prisma";
import { OutfitStylingAdvice } from "../types";

export class StylingRepository {
  async saveInstructions(outfitId: string, instructions: OutfitStylingAdvice[]) {
    return prisma.$transaction(
      instructions.map((item) =>
        prisma.stylingInstruction.create({
          data: {
            outfitId,
            garmentSlot: item.slot as any,
            instruction: item.instruction,
            tipType: item.tipType as any,
          },
        })
      )
    );
  }

  async getInstructionsByOutfitId(outfitId: string) {
    return prisma.stylingInstruction.findMany({
      where: { outfitId },
    });
  }
}

export const stylingRepository = new StylingRepository();
