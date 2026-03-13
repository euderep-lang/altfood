import { ArrowLeft } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const updates = [
  {
    date: '12 Mar 2026',
    emoji: '💬',
    title: 'Suporte in-app e pesquisa NPS',
    description: 'Widget de suporte direto no dashboard, feedback de pacientes e pesquisa de satisfação automática após 7 dias.',
  },
  {
    date: '12 Mar 2026',
    emoji: '🥤',
    title: 'Novos alimentos: Temperos, Bebidas e Suplementos',
    description: '30 novos alimentos adicionados em 3 categorias: Temperos e Condimentos, Bebidas Funcionais e Suplementos Alimentares.',
  },
  {
    date: '11 Mar 2026',
    emoji: '🎁',
    title: 'Programa de indicação',
    description: 'Indique colegas e ganhe 1 mês grátis de Pro por indicação. Novos indicados ganham 30 dias de trial.',
  },
  {
    date: '10 Mar 2026',
    emoji: '📊',
    title: 'Painel administrativo',
    description: 'Dashboard completo com métricas de crescimento, gestão de usuários e controle de planos.',
  },
  {
    date: 'Mar 2025',
    emoji: '🚀',
    title: 'Lançamento do Altfood',
    description: 'Plataforma de substituição alimentar para médicos e nutricionistas. Tabela TACO com 48 alimentos, páginas personalizadas para pacientes e PWA.',
  },
];

export default function Changelog() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <AltfoodIcon size="md" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Novidades</h1>
              <p className="text-xs text-muted-foreground">Últimas atualizações do Altfood</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {updates.map((update, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Card className="rounded-2xl shadow-sm border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                    {update.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-medium">{update.date}</span>
                    </div>
                    <h2 className="text-base font-bold text-foreground">{update.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{update.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </main>
    </div>
  );
}
