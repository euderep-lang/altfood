import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { EyeOff, Eye, Search, Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Food = Database['public']['Tables']['foods']['Row'];

interface Props {
  doctorId: string;
}

export default function HiddenFoodsManager({ doctorId }: Props) {
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: foods = [] } = useQuery({
    queryKey: ['all-foods-manage'],
    queryFn: async () => {
      const { data } = await supabase.from('foods').select('*').eq('is_active', true).order('name_short');
      return (data || []) as Food[];
    },
  });

  const { data: hiddenFoodIds = [] } = useQuery({
    queryKey: ['hidden-foods', doctorId],
    queryFn: async () => {
      const { data } = await supabase.from('hidden_foods').select('food_id').eq('doctor_id', doctorId);
      return (data || []).map((r: any) => r.food_id as string);
    },
  });

  const hideMutation = useMutation({
    mutationFn: async (foodId: string) => {
      const { error } = await supabase.from('hidden_foods').insert({ doctor_id: doctorId, food_id: foodId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hidden-foods', doctorId] });
      toast({ title: '✅ Alimento ocultado', description: 'Não aparecerá mais para seus pacientes.' });
    },
  });

  const showMutation = useMutation({
    mutationFn: async (foodId: string) => {
      const { error } = await supabase.from('hidden_foods').delete().eq('doctor_id', doctorId).eq('food_id', foodId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hidden-foods', doctorId] });
      toast({ title: '✅ Alimento restaurado', description: 'Voltará a aparecer para seus pacientes.' });
    },
  });

  const filtered = search.trim()
    ? foods.filter(f => f.name_short.toLowerCase().includes(search.toLowerCase()) || f.name.toLowerCase().includes(search.toLowerCase()))
    : foods;

  const hiddenFoods = filtered.filter(f => hiddenFoodIds.includes(f.id));
  const visibleFoods = filtered.filter(f => !hiddenFoodIds.includes(f.id));

  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <EyeOff className="w-4 h-4" /> Alimentos ocultos ({hiddenFoodIds.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alimento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl h-10 text-sm"
          />
        </div>

        {hiddenFoods.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Ocultos</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {hiddenFoods.map(f => (
                <div key={f.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-destructive/5 border border-destructive/10">
                  <span className="text-sm text-foreground">{f.name_short}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => showMutation.mutate(f.id)}
                    disabled={showMutation.isPending}
                    className="h-7 text-xs gap-1 text-primary"
                  >
                    <Eye className="w-3 h-3" /> Mostrar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {search.trim() && visibleFoods.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Visíveis</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {visibleFoods.slice(0, 20).map(f => (
                <div key={f.id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted/50">
                  <span className="text-sm text-foreground">{f.name_short}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => hideMutation.mutate(f.id)}
                    disabled={hideMutation.isPending}
                    className="h-7 text-xs gap-1 text-destructive"
                  >
                    <EyeOff className="w-3 h-3" /> Ocultar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!search.trim() && hiddenFoods.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Nenhum alimento oculto. Busque um alimento acima para ocultá-lo.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
