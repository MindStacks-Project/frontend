import appRoute from "@genkit-ai/next";
import { NextRequest, NextResponse } from "next/server";

import { ai } from "@/ai/genkit";
import "@/ai/dev";

type RouteParams = {
  params: Promise<{
    flow?: string[];
  }>;
};

const createNotFoundResponse = () =>
  NextResponse.json({ error: "Flow not found" }, { status: 404 });

export async function POST(req: NextRequest, context: RouteParams) {
  const { flow } = await context.params;
  const [actionType, ...actionSegments] = flow ?? [];
  if (!actionType || actionSegments.length === 0) {
    return createNotFoundResponse();
  }

  const actionName = actionSegments.join("/");
  const registryKey = `/${actionType}/${actionName}`;

  try {
    const action = await ai.registry.lookupAction(registryKey);
    const handler = appRoute(action);
    return handler(req);
  } catch (error) {
    if (typeof error === "object" && error && "status" in error) {
      const status = (error as { status?: string }).status;
      if (status === "NOT_FOUND") {
        return createNotFoundResponse();
      }
    }
    console.error(
      `Failed to run Genkit action '${registryKey}':`,
      error
    );
    return NextResponse.json(
      { error: "Failed to execute flow" },
      { status: 500 }
    );
  }
}
