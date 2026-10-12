import { NextResponse } from "next/server";

import {
  clearCepHistoryUseCase,
  deleteCepHistoryEntryUseCase,
  listCepHistoryUseCase,
} from "../../../../infrastructure/container";

export async function GET() {
  const items = await listCepHistoryUseCase.execute();
  return NextResponse.json(items);
}

export async function DELETE(request: Request) {
  const cep = new URL(request.url).searchParams.get("cep");

  if (cep !== null) {
    if (!/^\d{8}$/.test(cep)) {
      return NextResponse.json({ error: "Informe um CEP válido." }, { status: 400 });
    }

    await deleteCepHistoryEntryUseCase.execute(cep);
    return NextResponse.json({ success: true });
  }

  await clearCepHistoryUseCase.execute();
  return NextResponse.json({ success: true });
}
