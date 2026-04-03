'use client';

import useSWR from 'swr';
import { AgendamentosSection } from '@/components/agendamento/AgendamentosSection';
import { BotBanner } from '@/components/agendamento/BotBanner';
import { BotConfigForm } from '@/components/agendamento/BotConfigForm';
import { ComandosGuia } from '@/components/agendamento/ComandosGuia';
import { PendentesSection } from '@/components/agendamento/PendentesSection';
import { ServicosSection } from '@/components/agendamento/ServicosSection';
import { FeatureLocked } from '@/components/FeatureLocked';
import { API_BASE, fetcher } from '@/lib/api';
import type { AccessFlags, AgendamentoConfig } from '@/lib/types';

const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || 'https://wa.me/5511999999999';

export default function AgendamentoPage() {
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

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Agendamento via WhatsApp</h1>
          <p className="mt-2 text-zinc-400">
            Configure o bot, gerencie serviços e acompanhe os agendamentos. Webhook oazap: painel{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-zinc-300">/admin</code> na API.
          </p>
        </header>

        <BotBanner config={config} loading={loadingConfig} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BotConfigForm />
          <PendentesSection />
        </div>

        <div className="mt-6 space-y-6">
          <AgendamentosSection />
          <ServicosSection />
          <ComandosGuia />
        </div>
      </div>
    </div>
  );
}
