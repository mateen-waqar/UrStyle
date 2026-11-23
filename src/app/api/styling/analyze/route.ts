import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { styleRuleEvaluator } from "@/modules/outfit-styling-engine/services/styleRuleEvaluator";
import { ruleEvaluationEngine } from "@/modules/outfit-generation-engine/services/ruleEvaluationEngine";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AnalyzeStylingSchema = z.object({
  items: z.array(z.any()).optional(),
  itemIds: z.array(z.string()).optional(),
  occasion: z.string().default("CASUAL_OUTING"),
  formality: z.string().default("SMART_CASUAL"),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await request.json();
    const { items: providedItems, itemIds, occasion, formality } = AnalyzeStylingSchema.parse(rawBody);

    let itemsToAnalyze = providedItems || [];

    // If itemIds are provided instead of full items, fetch from database ensuring user ownership
    if ((!itemsToAnalyze || itemsToAnalyze.length === 0) && itemIds && itemIds.length > 0) {
      itemsToAnalyze = await prisma.wardrobeItem.findMany({
        where: {
          id: { in: itemIds },
          userId: user.id, // Strictly scoped to authenticated user
        },
      });
    }

    if (!itemsToAnalyze || itemsToAnalyze.length === 0) {
      return NextResponse.json({ error: "No items provided for analysis" }, { status: 400 });
    }

    // Run rule evaluation engine for compatibility scores
    const scoreResult = ruleEvaluationEngine.scoreOutfit(
      itemsToAnalyze,
      occasion as any,
      formality as any,
      "ALL_SEASON"
    );

    // Run style rule evaluator for detailed editorial recommendations
    const stylingResult = styleRuleEvaluator.evaluateOutfit(
      itemsToAnalyze,
      occasion as any,
      formality as any
    );

    return NextResponse.json({
      score: scoreResult,
      styling: stylingResult,
    });
  } catch (err: any) {
    console.error("Styling analysis error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to analyze outfit styling" },
      { status: 400 }
    );
  }
}
