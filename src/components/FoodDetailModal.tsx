import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Food = Database['public']['Tables']['foods']['Row'];

const SERVING_SIZES = [50, 100, 150, 200];

const FOOD_TIPS: Record<string, { tips: string; tags: string[] }> = {
  // Proteínas
  'Whey protein': { tips: 'Ideal para pós-treino. Misture com água gelada ou leite vegetal. Pode ser adicionado a smoothies e panquecas proteicas.', tags: ['ganho muscular', 'pós-treino'] },
  'Proteína vegana': { tips: 'Ótima alternativa para intolerantes à lactose. Combine com frutas e leite vegetal para melhor sabor.', tags: ['ganho muscular', 'intolerantes à lactose', 'veganos'] },
  'Creatina': { tips: 'Tome 5g diários com água. Não precisa de fase de carga. Consistência é mais importante que timing.', tags: ['ganho muscular', 'performance'] },
  'Colágeno': { tips: 'Dissolva em água ou suco. Pode ser tomado em jejum. Auxilia na saúde da pele, cabelo e articulações.', tags: ['saúde da pele', 'articulações'] },
  'Glutamina': { tips: 'Tome com água após exercícios intensos. Auxilia na recuperação muscular e saúde intestinal.', tags: ['recuperação', 'saúde intestinal'] },
  'Spirulina': { tips: 'Adicione a smoothies ou sucos verdes. Rica em proteínas e antioxidantes. Comece com doses pequenas.', tags: ['antioxidante', 'veganos', 'detox'] },
  'Clorela': { tips: 'Similar à spirulina. Pode ser misturada em sucos. Auxilia na desintoxicação e fortalece imunidade.', tags: ['detox', 'imunidade', 'veganos'] },
  // Bebidas
  'Água de coco': { tips: 'Ideal para hidratação pós-exercício. Prefira a versão natural sem adição de açúcar. Serve como base para smoothies.', tags: ['hidratação', 'diabéticos', 'perda de peso'] },
  'Kefir': { tips: 'Probiótico natural. Consuma diariamente para melhorar a flora intestinal. Pode substituir iogurte em receitas.', tags: ['saúde intestinal', 'probiótico'] },
  'Kombucha': { tips: 'Bebida fermentada rica em probióticos. Limite a 300ml/dia. Evite versões com muito açúcar adicionado.', tags: ['probiótico', 'saúde intestinal', 'perda de peso'] },
  'Chá verde': { tips: 'Rico em catequinas e antioxidantes. Evite tomar próximo às refeições (interfere na absorção de ferro). 2-3 xícaras/dia.', tags: ['antioxidante', 'perda de peso', 'metabolismo'] },
  'Chá de hibisco': { tips: 'Pode ser consumido quente ou gelado. Auxilia no controle da pressão arterial. Tem efeito diurético leve.', tags: ['perda de peso', 'diurético', 'pressão arterial'] },
  'Leite de amêndoas': { tips: 'Baixo em calorias. Ótima alternativa para intolerantes à lactose. Use em vitaminas, café e receitas.', tags: ['intolerantes à lactose', 'perda de peso', 'veganos'] },
  'Leite de aveia': { tips: 'Rico em fibras. Textura cremosa ideal para café e receitas. Verifique se não contém glúten se necessário.', tags: ['intolerantes à lactose', 'veganos', 'fibras'] },
  // Temperos
  'Açafrão': { tips: 'Use em arroz, sopas e molhos. Tem propriedades anti-inflamatórias. Combine com pimenta-do-reino para melhor absorção.', tags: ['anti-inflamatório', 'antioxidante'] },
  'Cúrcuma': { tips: 'Poderoso anti-inflamatório. Use em Golden Milk, sopas e temperos. Combine com pimenta-do-reino e gordura para melhor absorção.', tags: ['anti-inflamatório', 'antioxidante', 'imunidade'] },
  'Gengibre': { tips: 'Use fresco em chás, sucos e pratos asiáticos. Auxilia na digestão e tem efeito termogênico.', tags: ['digestão', 'termogênico', 'anti-inflamatório'] },
  'Canela': { tips: 'Adicione a frutas, aveia e vitaminas. Auxilia no controle glicêmico. Use a versão Ceilão para consumo frequente.', tags: ['diabéticos', 'controle glicêmico', 'termogênico'] },
};

function getDefaultTips(food: Food): { tips: string; tags: string[] } {
  const cal = Number(food.calories);
  const prot = Number(food.protein);
  const carb = Number(food.carbohydrates);
  const fat = Number(food.fat);
  const fiber = Number(food.fiber);

  const tags: string[] = [];
  if (prot > 15) tags.push('ganho muscular');
  if (cal < 50 && carb < 10) tags.push('perda de peso');
  if (fiber > 5) tags.push('fibras', 'saúde intestinal');
  if (cal < 30) tags.push('baixa caloria');
  if (fat < 2 && cal < 100) tags.push('diabéticos');
  if (tags.length === 0) tags.push('alimentação equilibrada');

  return {
    tips: `${food.preparation ? `Modo de preparo: ${food.preparation}. ` : ''}Pode ser incluído em diversas preparações do dia a dia. Consulte seu nutricionista para a melhor forma de consumo.`,
    tags,
  };
}

interface FoodDetailModalProps {
  food: Food | null;
  open: boolean;
  onClose: () => void;
  categoryIcon?: string;
  categoryColor?: string;
  doctorName?: string;
}

export default function FoodDetailModal({ food, open, onClose, categoryIcon, categoryColor, doctorName }: FoodDetailModalProps) {
  const [serving, setServing] = useState(100);

  const details = useMemo(() => {
    if (!food) return null;
    return FOOD_TIPS[food.name_short] || getDefaultTips(food);
  }, [food]);

  if (!food) return null;

  const factor = serving / 100;
  const macros = [
    { label: 'Calorias', value: (Number(food.calories) * factor).toFixed(1), unit: 'kcal' },
    { label: 'Proteínas', value: (Number(food.protein) * factor).toFixed(1), unit: 'g' },
    { label: 'Carboidratos', value: (Number(food.carbohydrates) * factor).toFixed(1), unit: 'g' },
    { label: 'Gorduras', value: (Number(food.fat) * factor).toFixed(1), unit: 'g' },
    { label: 'Fibras', value: (Number(food.fiber) * factor).toFixed(1), unit: 'g' },
  ];

  const shareText = `🍽️ ${food.name_short} (${serving}g)\n${macros.map(m => `${m.label}: ${m.value}${m.unit}`).join('\n')}\n\n${details?.tips || ''}\n\nVia Altfood${doctorName ? ` - Dr(a). ${doctorName}` : ''}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const tagColors: Record<string, string> = {
    'ganho muscular': '#3B82F6',
    'perda de peso': '#22C55E',
    'diabéticos': '#EAB308',
    'intolerantes à lactose': '#8B5CF6',
    'veganos': '#16A34A',
    'anti-inflamatório': '#EF4444',
    'antioxidante': '#F97316',
    'saúde intestinal': '#06B6D4',
    'probiótico': '#14B8A6',
    'imunidade': '#EC4899',
    'pós-treino': '#6366F1',
    'termogênico': '#DC2626',
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ backgroundColor: `${categoryColor || '#0F766E'}15` }}>
              {categoryIcon || '🍽️'}
            </div>
            <div>
              <DialogTitle className="text-lg">{food.name_short}</DialogTitle>
              <p className="text-xs text-muted-foreground">{food.name}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Serving selector */}
        <div className="flex gap-2 flex-wrap">
          {SERVING_SIZES.map(s => (
            <button
              key={s}
              onClick={() => setServing(s)}
              className="px-3 py-2 rounded-full text-sm font-semibold transition-all min-h-[36px]"
              style={{
                backgroundColor: serving === s ? (categoryColor || '#0F766E') : `${categoryColor || '#0F766E'}10`,
                color: serving === s ? '#fff' : (categoryColor || '#0F766E'),
              }}
            >
              {s}g
            </button>
          ))}
        </div>

        {/* Nutrition table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2.5 px-3 font-semibold text-xs text-muted-foreground uppercase">Nutriente</th>
                <th className="text-right py-2.5 px-3 font-semibold text-xs text-muted-foreground uppercase">Por {serving}g</th>
              </tr>
            </thead>
            <tbody>
              {macros.map((m, i) => (
                <tr key={m.label} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className="py-2 px-3 text-foreground font-medium">{m.label}</td>
                  <td className="py-2 px-3 text-right font-semibold text-foreground">{m.value} {m.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Preparation tips */}
        {details && (
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs font-semibold text-foreground mb-1.5">💡 Como preparar</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{details.tips}</p>
            </div>

            {/* Tags */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">🎯 Melhor para</p>
              <div className="flex flex-wrap gap-1.5">
                {details.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: `${tagColors[tag] || '#6B7280'}15`,
                      color: tagColors[tag] || '#6B7280',
                    }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Source */}
        <p className="text-[10px] text-muted-foreground">Fonte: {food.source}</p>

        {/* Share */}
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <Button className="w-full rounded-xl gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white">
            <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
          </Button>
        </a>
      </DialogContent>
    </Dialog>
  );
}
