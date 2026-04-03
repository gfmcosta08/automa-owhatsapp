'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { AgendamentosSection } from '@/components/agendamento/AgendamentosSection';
import { BotBanner } from '@/components/agendamento/BotBanner';
import { BotConfigForm } from '@/components/agendamento/BotConfigForm';
import { ComandosGuia } from '@/components/agendamento/ComandosGuia';
import { PendentesSection } from '@/components/agendamento/PendentesSection';
import { ServicosSection } from '@/components/agendamento/ServicosSection';
import { FeatureLocked } from '@/components/FeatureLocked';
import { API_BASE, fetcher, getAdminPanelUrl } from '@/lib/api';
import type { AccessFlags, AgendamentoConfig } from '@/lib/types';

const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || 'https://wa.me/5511999999999';

type View = 'principal' | 'configuracao';

export default function AgendamentoPage() {
  const [view, setView] = useState<View>('principal');

  const { data: access, isLoading: loadingAccess } = useSWR<AccessFlags>(
    `${API_BASE}/agendamento/access`,
    fetcher
  );
  const { data: config, isLoading: loadingConfig } = useSWR<AgendamentoConfig | null>(
    `${API_BASE}/agendamento/config`,
    fetcher
  );

  if (loadingAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-10">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-10 w-1/2 rounded bg-white/10" />
          <div className="h-20 rounded-2xl bg-white/5" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-96 rounded-2xl bg-white/5" />
            <div className="h-64 rounded-2xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (access && !access.enable_agendamento && !access.is_superadmin) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-10">
        <FeatureLocked supportUrl={SUPPORT_URL} />
      </div>
    );
  }

  if (view === 'configuracao') {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <header className="mb-8 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setView('principal')}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10"
            >
              ← Voltar
            </button>
            <h1 className="text-xl font-bold text-white">Configurações</h1>
          </header>

          <BotConfigForm />

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <h2 className="mb-1 text-base font-semibold text-white">Painel administrativo</h2>
            <p className="mb-4 text-sm text-zinc-400">
              Credenciais UazAPI, URL do webhook, dados da empresa e operação avançada ficam no painel da API.
            </p>
            <a
              href={getAdminPanelUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-600"
            >
              Abrir painel administrativo ↗
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">Agendamento via WhatsApp</h1>
            <p className="mt-2 text-zinc-400">
              Gerencie serviços e acompanhe os agendamentos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setView('configuracao')}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10"
          >
            ⚙ Configurações
          </button>
        </header>

        <BotBanner config={config} loading={loadingConfig} />

        <PendentesSection />

        <div className="mt-6 space-y-6">
          <AgendamentosSection />
          <ServicosSection />
          <ComandosGuia />
        </div>
      </div>
    </div>
  );
}
