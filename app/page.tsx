"use client";

import { startTransition, useEffect, useState } from "react";
import RoofMap from "./roof-map-client";

type CepAddress = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  searchedAt: string;
};

async function fetchCepHistory(signal?: AbortSignal): Promise<CepAddress[]> {
  try {
    const response = await fetch("/api/ceps/history", { signal });
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [cep, setCep] = useState("");
  const [result, setResult] = useState<CepAddress | null>(null);
  const [history, setHistory] = useState<CepAddress[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [deletingCep, setDeletingCep] = useState<string | null>(null);
  const [activeHistoryMapCep, setActiveHistoryMapCep] = useState<string | null>(null);
  const [historyResidenceNumber, setHistoryResidenceNumber] = useState("");
  const [isHistoryMapOpen, setIsHistoryMapOpen] = useState(false);
  const [historyMapError, setHistoryMapError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) {
      return digits;
    }

    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const loadHistory = async () => {
    setHistory(await fetchCepHistory());
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Apagar todo o histórico de CEPs?")) {
      return;
    }

    setIsClearingHistory(true);
    setHistoryError("");

    try {
      const response = await fetch("/api/ceps/history", { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Não foi possível apagar o histórico.");
      }
      setHistory([]);
      setActiveHistoryMapCep(null);
      setIsHistoryMapOpen(false);
    } catch (clearError) {
      setHistoryError(clearError instanceof Error ? clearError.message : "Não foi possível apagar o histórico.");
    } finally {
      setIsClearingHistory(false);
    }
  };

  const handleDeleteHistoryEntry = async (targetCep: string) => {
    setDeletingCep(targetCep);
    setHistoryError("");

    try {
      const response = await fetch(`/api/ceps/history?cep=${encodeURIComponent(targetCep)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Não foi possível apagar este CEP do histórico.");
      }
      setHistory((currentHistory) => currentHistory.filter((item) => item.cep !== targetCep));
      if (activeHistoryMapCep === targetCep) {
        setActiveHistoryMapCep(null);
        setIsHistoryMapOpen(false);
      }
    } catch (deleteError) {
      setHistoryError(deleteError instanceof Error ? deleteError.message : "Não foi possível apagar este CEP do histórico.");
    } finally {
      setDeletingCep(null);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchCepHistory(controller.signal).then((historyResult) => {
      startTransition(() => setHistory(historyResult));
    });
    return () => controller.abort();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCep = cep.trim();
    if (!normalizedCep) {
      setError("Digite um CEP antes de consultar.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/ceps?cep=${encodeURIComponent(normalizedCep)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "CEP inválido.");
      }

      setResult(data);
      await loadHistory();
    } catch (searchError) {
      setResult(null);
      setError(searchError instanceof Error ? searchError.message : "CEP inválido.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    setCep("");
    setResult(null);
    setError("");
  }

  function handleToggleHistoryMap(targetCep: string) {
    if (activeHistoryMapCep === targetCep) {
      setActiveHistoryMapCep(null);
      setIsHistoryMapOpen(false);
      setHistoryMapError("");
      return;
    }

    setActiveHistoryMapCep(targetCep);
    setHistoryResidenceNumber("");
    setIsHistoryMapOpen(false);
    setHistoryMapError("");
  }

  function handleOpenHistoryMap(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!historyResidenceNumber.trim()) {
      setHistoryMapError("Informe o número da residência ou S/N antes de abrir o mapa.");
      setIsHistoryMapOpen(false);
      return;
    }

    setHistoryMapError("");
    setIsHistoryMapOpen(true);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:items-stretch">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">
            ViaCEP + SQLite
          </p>
          <h1 className="mt-3 text-3xl font-bold">Consulta de CEP</h1>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              name="cep"
              value={cep}
              onChange={(event) => setCep(formatCep(event.target.value))}
              placeholder="Digite o CEP (ex.: 01001-000)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-sky-500 focus:bg-white sm:flex-1"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isLoading ? "Consultando..." : "Consultar"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto"
            >
              Limpar
            </button>
          </form>

          {error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {result ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold">Resultado</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-slate-500">CEP</dt><dd className="font-medium">{result.cep}</dd></div>
                <div><dt className="text-slate-500">UF</dt><dd className="font-medium">{result.uf}</dd></div>
                <div className="sm:col-span-2"><dt className="text-slate-500">Logradouro</dt><dd className="font-medium">{result.logradouro}</dd></div>
                <div><dt className="text-slate-500">Bairro</dt><dd className="font-medium">{result.bairro}</dd></div>
                <div><dt className="text-slate-500">Localidade</dt><dd className="font-medium">{result.localidade}</dd></div>
                <div><dt className="text-slate-500">Complemento</dt><dd className="font-medium">{result.complemento || "—"}</dd></div>
                <div><dt className="text-slate-500">DDD</dt><dd className="font-medium">{result.ddd || "—"}</dd></div>
              </dl>
            </div>
          ) : null}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Histórico</h2>
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={history.length === 0 || isClearingHistory || deletingCep !== null}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isClearingHistory ? "Apagando..." : "Apagar histórico"}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            O histórico não guarda o número residencial. Informe-o para abrir o mapa aéreo; “Mapa” busca o endereço aproximado.
          </p>
          {historyError ? <p className="mt-3 text-sm text-red-700">{historyError}</p> : null}
          <ul className="mt-5 space-y-3">
            {history.length === 0 ? (
              <li className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Nenhum CEP consultado ainda.
              </li>
            ) : (
              history.slice(0, 8).map((item) => (
                <li key={`${item.cep}-${item.searchedAt}`} className="min-h-[112px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:min-h-[72px]">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleDeleteHistoryEntry(item.cep)}
                      disabled={isClearingHistory || deletingCep !== null}
                      aria-label={`Apagar CEP ${item.cep} do histórico`}
                      title={`Apagar CEP ${item.cep}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xl leading-none text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingCep === item.cep ? "…" : "×"}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{item.cep}</span>
                        <span className="text-xs text-slate-500">{item.uf}</span>
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-600">{item.localidade} · {item.bairro}</p>
                    </div>
                    <div className="flex basis-full items-center justify-end gap-2 sm:basis-auto">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          [item.logradouro, item.bairro, item.cep, item.localidade, item.uf, "Brasil"]
                            .filter(Boolean)
                            .join(", "),
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Buscar endereço aproximado do CEP ${item.cep} no Google Maps`}
                        title="Busca aproximada: o histórico não guarda número residencial"
                        className="shrink-0 rounded-md border border-sky-200 px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
                      >
                        Mapa
                      </a>
                      <button
                        type="button"
                        onClick={() => handleToggleHistoryMap(item.cep)}
                        aria-expanded={activeHistoryMapCep === item.cep}
                        aria-controls={`history-map-${item.cep}`}
                        className="shrink-0 rounded-md border border-sky-700 bg-sky-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-800"
                      >
                        Mapa aéreo
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
          {activeHistoryMapCep ? (() => {
            const activeAddress = history.find((item) => item.cep === activeHistoryMapCep);
            if (!activeAddress) return null;

            return (
              <section id={`history-map-${activeAddress.cep}`} className="mt-4 border-t border-slate-200 pt-4">
                <h3 className="font-medium">Mapa aéreo: {activeAddress.cep}</h3>
                <form onSubmit={handleOpenHistoryMap} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <label htmlFor={`residence-number-${activeAddress.cep}`} className="text-sm text-slate-600">
                      Número da residência
                    </label>
                    <input
                      id={`residence-number-${activeAddress.cep}`}
                      name="residence-number"
                      type="text"
                      autoComplete="address-line2"
                      value={historyResidenceNumber}
                      onChange={(event) => {
                        setHistoryResidenceNumber(event.target.value);
                        setIsHistoryMapOpen(false);
                        setHistoryMapError("");
                      }}
                      placeholder="Ex.: 123, 42A ou S/N"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
                  >
                    Abrir mapa
                  </button>
                </form>
                {historyMapError ? <p role="alert" className="mt-2 text-sm text-red-700">{historyMapError}</p> : null}
                {isHistoryMapOpen && historyResidenceNumber.trim() ? (
                  <RoofMap
                    key={`${activeAddress.cep}-${historyResidenceNumber.trim()}`}
                    address={activeAddress}
                    residenceNumber={historyResidenceNumber.trim()}
                  />
                ) : null}
              </section>
            );
          })() : null}
          <p className="mt-4 border-t border-slate-200 pt-4 text-right text-sm text-slate-500">
            Total: {history.length} {history.length === 1 ? "CEP consultado" : "CEPs consultados"}
          </p>
        </aside>
      </div>
    </main>
  );
}
