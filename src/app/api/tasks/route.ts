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
        stores,
        status,
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      dueDate,
      category,
      stores = 1,
      status = "Pendiente",
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "El título es obligatorio" },
        { status: 400 },
      );
    }

    const validStatuses = [
      "Pendiente",
      "En progreso",
      "Completada",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado no válido" },
        { status: 400 },
      );
    }

    const storesCount = Number(stores);

    if (!Number.isInteger(storesCount) || storesCount < 1) {
      return NextResponse.json(
        { error: "El número de tiendas no es válido" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO tasks (
        title,
        description,
        due_date,
        category,
        stores,
        status
      )
      VALUES (
        ${title.trim()},
        ${description?.trim() || null},
        ${dueDate || null},
        ${category || "Operaciones"},
        ${storesCount},
        ${status}
      )
      RETURNING
        id,
        title,
        description,
        due_date,
        category,
        stores,
        status,
        created_at,
        updated_at
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);

    return NextResponse.json(
      { error: "No se pudo crear la tarea" },
      { status: 500 },
    );
  }
}
