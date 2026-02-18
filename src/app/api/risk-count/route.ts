import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("risk_alerts")
      .select("id", { count: "exact", head: true })
      .eq("is_resolved", false);

    if (error) {
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
