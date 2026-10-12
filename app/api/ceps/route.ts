import { NextResponse } from "next/server";

import { searchCepUseCase } from "../../../infrastructure/container";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cep = searchParams.get("cep");

  if (!cep) {
    return NextResponse.json({ error: "Parâmetro cep é obrigatório." }, { status: 400 });
  }

  try {
    const result = await searchCepUseCase.execute(cep);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "CEP inválido." },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { cep?: string };
    const cep = body.cep ?? "";

    if (!cep) {
      return NextResponse.json({ error: "CEP é obrigatório." }, { status: 400 });
    }

    const result = await searchCepUseCase.execute(cep);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "CEP inválido." },
      { status: 400 },
    );
  }
}
