import { getTextbooks } from "@/lib/actions/textbooks";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const textbooks = await getTextbooks();
    return NextResponse.json(textbooks);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
