import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type Food = Database['public']['Tables']['foods']['Row'];

interface Props {
  foods: [Food, Food] | null;
  open: boolean;
  onClose: () => void;
}

function better(a: number, b: number, lowerIsBetter: boolean): 'a' | 'b' | 'tie' {
  if (Math.abs(a - b) < 0.1) return 'tie';
  if (lowerIsBetter) return a < b ? 'a' : 'b';
  return a > b ? 'a' : 'b';
}

export default function FoodComparisonModal({ foods, open, onClose }: Props) {
  if (!foods) return null;
  const [a, b] = foods;

  const nutrients = [
    { label: 'Calorias', key: 'calories' as const, unit: 'kcal', lowerBetter: true },
    { label: 'Proteínas', key: 'protein' as const, unit: 'g', lowerBetter: false },
    { label: 'Carboidratos', key: 'carbohydrates' as const, unit: 'g', lowerBetter: true },
    { label: 'Gorduras', key: 'fat' as const, unit: 'g', lowerBetter: true },
    { label: 'Fibras', key: 'fiber' as const, unit: 'g', lowerBetter: false },
  ];

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Comparação (por 100g)</DialogTitle>
        </DialogHeader>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2.5 px-3 font-semibold text-xs text-muted-foreground">Nutriente</th>
                <th className="text-center py-2.5 px-2 font-semibold text-xs text-foreground max-w-[100px] truncate">{a.name_short}</th>
                <th className="text-center py-2.5 px-2 font-semibold text-xs text-foreground max-w-[100px] truncate">{b.name_short}</th>
              </tr>
            </thead>
            <tbody>
              {nutrients.map((n, i) => {
                const va = Number(a[n.key]);
                const vb = Number(b[n.key]);
                const winner = better(va, vb, n.lowerBetter);
                return (
                  <tr key={n.key} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                    <td className="py-2 px-3 text-foreground font-medium text-xs">{n.label}</td>
                    <td className={`py-2 px-2 text-center text-sm font-semibold ${winner === 'a' ? 'text-green-600' : winner === 'b' ? 'text-red-500' : 'text-foreground'}`}>
                      {va} {n.unit}
                      {winner === 'a' && ' ✓'}
                    </td>
                    <td className={`py-2 px-2 text-center text-sm font-semibold ${winner === 'b' ? 'text-green-600' : winner === 'a' ? 'text-red-500' : 'text-foreground'}`}>
                      {vb} {n.unit}
                      {winner === 'b' && ' ✓'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">Valores por 100g · Fonte: TACO 4ª Ed.</p>

        <Button variant="outline" onClick={onClose} className="w-full rounded-xl">
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
