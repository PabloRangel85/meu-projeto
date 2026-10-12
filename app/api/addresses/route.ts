import { NextResponse } from "next/server";

import { createAddressUseCase, listAddressesUseCase } from "../../../infrastructure/container";

export async function GET() {
  const addresses = await listAddressesUseCase.execute();
  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { cep?: string };
    const cep = body.cep ?? "";

    if (!cep) {
      return NextResponse.json({ error: "CEP é obrigatório." }, { status: 400 });
    }

    const result = await createAddressUseCase.execute(cep);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "CEP inválido." },
      { status: 400 },
    );
  }
}
