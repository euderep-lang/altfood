import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateSubstitutions, getSimilarityLabel, type SubstitutionResult } from '@/lib/substitutionAlgorithm';
import type { Database } from '@/integrations/supabase/types';

type Food = Database['public']['Tables']['foods']['Row'];
type FoodCategory = Database['public']['Tables']['food_categories']['Row'];
type Doctor = Database['public']['Tables']['doctors']['Row'];

const QUICK_WEIGHTS = [50, 100, 150, 200, 250, 300];

export default function PatientPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [weight, setWeight] = useState(100);
  const [results, setResults] = useState<SubstitutionResult[]>([]);
  const [computing, setComputing] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Fetch doctor by slug
  const { data: doctor, isLoading: loadingDoctor, error: doctorError } = useQuery({
    queryKey: ['doctor-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data as Doctor;
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['food-categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('food_categories')
        .select('*')
        .order('sort_order');
      return (data || []) as FoodCategory[];
    },
  });

  // Fetch foods
  const { data: foods = [] } = useQuery({
    queryKey: ['foods'],
    queryFn: async () => {
      const { data } = await supabase
        .from('foods')
        .select('*')
        .eq('is_active', true)
        .order('name_short');
      return (data || []) as Food[];
    },
  });

  // Log page view
  useEffect(() => {
    if (doctor) {
      supabase.from('page_views').insert({ doctor_id: doctor.id, ip_hash: 'anonymous' });
    }
  }, [doctor]);

  // Apply doctor colors
  useEffect(() => {
    if (doctor) {
      document.documentElement.style.setProperty('--doctor-primary', doctor.primary_color);
    }
    return () => {
      document.documentElement.style.removeProperty('--doctor-primary');
    };
  }, [doctor]);

  // Search filter
  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return foods.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.name_short.toLowerCase().includes(q) ||
      (f.preparation && f.preparation.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [searchQuery, foods]);

  // Foods by category
  const foodsByCategory = useMemo(() => {
    const map: Record<string, Food[]> = {};
    categories.forEach(c => { map[c.id] = []; });
    foods.forEach(f => {
      if (f.category_id && map[f.category_id]) {
        map[f.category_id].push(f);
      }
    });
    return map;
  }, [foods, categories]);

  const selectFood = (food: Food) => {
    setSelectedFood(food);
    setSearchQuery('');
    setShowSearch(false);
    setResults([]);
    setWeight(100);
  };

  const findSubstitutions = () => {
    if (!selectedFood) return;
    setComputing(true);

    // Log query
    if (doctor) {
      supabase.from('substitution_queries').insert({
        doctor_id: doctor.id,
        food_name: selectedFood.name_short,
        weight_grams: weight,
      });
    }

    const categoryName = categories.find(c => c.id === selectedFood.category_id)?.name || '';

    setTimeout(() => {
      const subs = calculateSubstitutions(selectedFood, weight, foods, categories, categoryName);
      setResults(subs);
      setComputing(false);
    }, 300);
  };

  if (loadingDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (doctorError || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="rounded-2xl shadow-md max-w-sm w-full">
          <CardContent className="p-8 text-center">
            <p className="text-xl font-bold text-foreground mb-2">Página não encontrada</p>
            <p className="text-muted-foreground text-sm">O link que você acessou não existe ou foi removido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primaryColor = doctor.primary_color || '#0F766E';
  const selectedCategory = selectedFood ? categories.find(c => c.id === selectedFood.category_id) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {doctor.logo_url ? (
            <img src={doctor.logo_url} alt={doctor.name} className="h-10 w-10 rounded-xl object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: primaryColor, color: '#fff' }}>
              {doctor.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{doctor.name}</p>
            <p className="text-xs text-muted-foreground">{doctor.document_type} {doctor.document_number} • {doctor.specialty}</p>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2 font-medium" style={{ color: primaryColor }}>
          Tabela de Substituição Alimentar
        </p>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4 pb-20">
        {/* Search */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alimento..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              className="pl-10 rounded-xl h-11"
            />
          </div>
          {showSearch && filteredFoods.length > 0 && (
            <Card className="absolute z-50 w-full mt-1 rounded-xl shadow-lg max-h-64 overflow-y-auto">
              <CardContent className="p-1">
                {filteredFoods.map(food => {
                  const cat = categories.find(c => c.id === food.category_id);
                  return (
                    <button
                      key={food.id}
                      onClick={() => selectFood(food)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted text-left transition-colors"
                    >
                      <span className="text-lg">{cat?.icon || '🍽️'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{food.name_short}</p>
                        <p className="text-xs text-muted-foreground">{food.preparation}</p>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Category Grid */}
        {!selectedFood && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {categories.map(cat => (
              <div key={cat.id}>
                <button
                  onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                  className="w-full rounded-2xl border border-border bg-card p-3 text-center hover:shadow-md transition-all"
                  style={{ borderColor: expandedCategory === cat.id ? primaryColor : undefined }}
                >
                  <span className="text-2xl block mb-1">{cat.icon}</span>
                  <p className="text-xs font-medium text-foreground leading-tight">{cat.name}</p>
                  <span className="text-[10px] text-muted-foreground">{foodsByCategory[cat.id]?.length || 0} itens</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Expanded category foods */}
        {!selectedFood && expandedCategory && (
          <Card className="rounded-2xl shadow-sm animate-fade-in">
            <CardContent className="p-2 max-h-64 overflow-y-auto">
              {(foodsByCategory[expandedCategory] || []).map(food => (
                <button
                  key={food.id}
                  onClick={() => selectFood(food)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-left transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{food.name_short}</p>
                    <p className="text-xs text-muted-foreground">{food.preparation}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{food.calories} kcal</span>
                </button>
              ))}
              {(foodsByCategory[expandedCategory] || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum alimento nesta categoria.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Selected food */}
        {selectedFood && (
          <div className="space-y-4 animate-fade-in">
            <Card className="rounded-2xl shadow-sm" style={{ borderLeft: `3px solid ${primaryColor}` }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{selectedFood.name_short}</p>
                    <p className="text-xs text-muted-foreground">{selectedFood.preparation}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Fonte: {selectedFood.source}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedFood(null); setResults([]); }} className="text-xs">
                    Trocar
                  </Button>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[
                    { label: 'Prot', value: `${selectedFood.protein}g`, color: '#3B82F6' },
                    { label: 'Carb', value: `${selectedFood.carbohydrates}g`, color: '#F59E0B' },
                    { label: 'Gord', value: `${selectedFood.fat}g`, color: '#EF4444' },
                    { label: 'Kcal', value: `${selectedFood.calories}`, color: '#8B5CF6' },
                  ].map(m => (
                    <span key={m.label} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-foreground font-medium">
                      {m.label}: {m.value}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weight input */}
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Quantidade</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={weight}
                    onChange={e => setWeight(Math.max(10, Math.min(500, Number(e.target.value))))}
                    className="text-2xl font-bold text-center rounded-xl h-14 w-28"
                    min={10}
                    max={500}
                  />
                  <span className="text-lg text-muted-foreground font-medium">g</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {QUICK_WEIGHTS.map(w => (
                    <Button
                      key={w}
                      variant={weight === w ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-lg text-xs"
                      onClick={() => setWeight(w)}
                    >
                      {w}g
                    </Button>
                  ))}
                </div>
                <Slider
                  value={[weight]}
                  onValueChange={v => setWeight(v[0])}
                  min={10}
                  max={500}
                  step={5}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* Find button */}
            <Button
              onClick={findSubstitutions}
              className="w-full rounded-xl h-12 text-base font-semibold"
              style={{ backgroundColor: primaryColor }}
              disabled={computing}
            >
              {computing ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
              Encontrar Substituições
            </Button>

            {/* Results */}
            {computing && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </div>
            )}

            {!computing && results.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">{results.length} substituições encontradas</p>
                {results.map((result, idx) => {
                  const sim = getSimilarityLabel(result.similarityScore);
                  const origProt = (Number(selectedFood.protein) * weight) / 100;
                  const origCarb = (Number(selectedFood.carbohydrates) * weight) / 100;
                  const origFat = (Number(selectedFood.fat) * weight) / 100;
                  const origCal = (Number(selectedFood.calories) * weight) / 100;

                  return (
                    <Card key={result.food.id} className="rounded-2xl shadow-sm animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                            style={{ backgroundColor: result.category?.color ? `${result.category.color}20` : '#f1f5f9' }}
                          >
                            {result.category?.icon || '🍽️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-sm text-foreground">{result.food.name_short}</p>
                                <p className="text-xs text-muted-foreground">{result.food.preparation}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-lg font-bold" style={{ color: primaryColor }}>{result.equivalentWeight}g</p>
                                <p className="text-[10px] text-muted-foreground">equivalente</p>
                              </div>
                            </div>

                            {/* Macro bars */}
                            <div className="mt-3 space-y-1.5">
                              <MacroBar label="Proteína" value={result.protein} original={origProt} color="#3B82F6" unit="g" />
                              <MacroBar label="Carboidratos" value={result.carbohydrates} original={origCarb} color="#F59E0B" unit="g" />
                              <MacroBar label="Gordura" value={result.fat} original={origFat} color="#EF4444" unit="g" />
                              <MacroBar label="Calorias" value={result.calories} original={origCal} color="#8B5CF6" unit="kcal" />
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs font-medium ${sim.color}`}>{sim.emoji} {sim.label}</span>
                              <span className="text-[10px] text-muted-foreground">Fonte: TACO 4ª Ed.</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          {doctor.name} • {doctor.document_type} {doctor.document_number}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Powered by <strong>Altfood</strong></p>
      </footer>
    </div>
  );
}

function MacroBar({ label, value, original, color, unit }: { label: string; value: number; original: number; color: string; unit: string }) {
  const maxVal = Math.max(value, original, 1);
  const pct = (value / maxVal) * 100;
  const origPct = (original / maxVal) * 100;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-medium text-foreground">{value}{unit}</span>
      </div>
      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full opacity-30" style={{ width: `${origPct}%`, backgroundColor: color }} />
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
