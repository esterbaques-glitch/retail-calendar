import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No se ha recibido ningún archivo." },
        { status: 400 },
      );
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo no puede superar los 10 MB." },
        { status: 400 },
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Solo se permiten JPG, PNG, WEBP y PDF." },
        { status: 400 },
      );
    }

    const blob = await put(`retail-calendar/${Date.now()}-${file.name}`, file, {
      access: "private",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      success: true,
      pathname: blob.pathname,
      url: blob.url,
    });
  } catch (error) {
    console.error("Error al subir documento:", error);

    return NextResponse.json(
      { error: "No se ha podido subir el documento." },
      { status: 500 },
    );
  }
}