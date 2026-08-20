import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tasks = await sql`
      SELECT
        id,
        title,
        description,
        due_date,
        category,
        created_at,
        updated_at
      FROM tasks
      ORDER BY due_date ASC NULLS LAST
    `;

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error loading tasks:", error);

    return NextResponse.json(
      { error: "No se pudieron cargar las tareas" },
      { status: 500 },
    );
  }
}
