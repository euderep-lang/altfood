import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Loader2, X, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateSubstitutions, getSimilarityLabel, type SubstitutionResult } from '@/lib/substitutionAlgorithm';
import type { Database } from '@/integrations/supabase/types';

type Food = Database['public']['Tables']['foods']['Row'];
type FoodCategory = Database['public']['Tables']['food_categories']['Row'];
type Doctor = Database['public']['Tables']['doctors']['Row'];

const QUICK_WEIGHTS = [50, 100, 150, 200, 250, 300];
const RECENT_FOODS_KEY = 'altfood_recent_foods';

function getRecentFoods(): { id: string; name: string }[] {
  try { return JSON.parse(localStorage.getItem(RECENT_FOODS_KEY) || '[]').slice(0, 5); }
  catch { return []; }
}
function addRecentFood(food: Food) {
  const recent = getRecentFoods().filter(f => f.id !== food.id);
  recent.unshift({ id: food.id, name: food.name_short });
  localStorage.setItem(RECENT_FOODS_KEY, JSON.stringify(recent.slice(0, 5)));
}

function getSimilarityPill(score: number): { label: string; bg: string; text: string } {
  if (score > 0.7) return { label: 'Muito similar', bg: '#22c55e20', text: '#16a34a' };
  if (score > 0.4) return { label: 'Similar', bg: '#eab30820', text: '#ca8a04' };
  return { label: 'Diferente', bg: '#f9731620', text: '#ea580c' };
}

function getSimilarityBorderColor(score: number): string {
  if (score > 0.7) return '#22c55e';
  if (score > 0.4) return '#eab308';
  return '#ef4444';
}

function compareBadge(value: number, original: number): { icon: string; color: string } {
  if (original === 0 && value === 0) return { icon: '≈', color: '#6b7280' };
  const diff = original === 0 ? 1 : (value - original) / original;
  if (Math.abs(diff) < 0.1) return { icon: '≈', color: '#6b7280' };
  if (diff > 0) return { icon: '↑', color: '#ef4444' };
  return { icon: '↓', color: '#22c55e' };
}

export default function PatientPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [weight, setWeight] = useState(100);
  const [results, setResults] = useState<SubstitutionResult[]>([]);
  const [computing, setComputing] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [recentFoods, setRecentFoods] = useState(getRecentFoods);

  const { data: doctor, isLoading: loadingDoctor, error: doctorError } = useQuery({
    queryKey: ['doctor-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('doctors').select('*').eq('slug', slug).single();
      if (error) throw error;
      return data as Doctor;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['food-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('food_categories').select('*').order('sort_order');
      return (data || []) as FoodCategory[];
    },
  });

  const { data: foods = [] } = useQuery({
    queryKey: ['foods'],
    queryFn: async () => {
      const { data } = await supabase.from('foods').select('*').eq('is_active', true).order('name_short');
      return (data || []) as Food[];
    },
  });

  useEffect(() => {
    if (doctor) {
      supabase.from('page_views').insert({ doctor_id: doctor.id, ip_hash: 'anonymous' });
    }
  }, [doctor]);

  useEffect(() => {
    if (doctor) document.documentElement.style.setProperty('--doctor-primary', doctor.primary_color);
    return () => { document.documentElement.style.removeProperty('--doctor-primary'); };
  }, [doctor]);

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return foods.filter(f =>
      f.name.toLowerCase().includes(q) || f.name_short.toLowerCase().includes(q) ||
      (f.preparation && f.preparation.toLowerCase().includes(q))
    ).slice(0, 12);
  }, [searchQuery, foods]);

  const foodsByCategory = useMemo(() => {
    const map: Record<string, Food[]> = {};
    categories.forEach(c => { map[c.id] = []; });
    foods.forEach(f => { if (f.category_id && map[f.category_id]) map[f.category_id].push(f); });
    return map;
  }, [foods, categories]);

  const selectFood = useCallback((food: Food) => {
    setSelectedFood(food);
    setSearchQuery('');
    setShowSearch(false);
    setResults([]);
    setWeight(100);
    setCategoryFilter(null);
    setExpandedCards(new Set());
    addRecentFood(food);
    setRecentFoods(getRecentFoods());
  }, []);

  const selectRecentFood = useCallback((id: string) => {
    const food = foods.find(f => f.id === id);
    if (food) selectFood(food);
  }, [foods, selectFood]);

  const findSubstitutions = () => {
    if (!selectedFood) return;
    setComputing(true);
    if (doctor) {
      supabase.from('substitution_queries').insert({
        doctor_id: doctor.id, food_name: selectedFood.name_short, weight_grams: weight,
      });
    }
    const categoryName = categories.find(c => c.id === selectedFood.category_id)?.name || '';
    setTimeout(() => {
      const subs = calculateSubstitutions(selectedFood, weight, foods, categories, categoryName);
      setResults(subs);
      setComputing(false);
    }, 400);
  };

  const filteredResults = useMemo(() => {
    if (!categoryFilter) return results;
    return results.filter(r => r.food.category_id === categoryFilter);
  }, [results, categoryFilter]);

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
  const showStickyButton = selectedFood && weight > 0 && results.length === 0 && !computing;

  const origProt = selectedFood ? (Number(selectedFood.protein) * weight) / 100 : 0;
  const origCarb = selectedFood ? (Number(selectedFood.carbohydrates) * weight) / 100 : 0;
  const origFat = selectedFood ? (Number(selectedFood.fat) * weight) / 100 : 0;
  const origCal = selectedFood ? (Number(selectedFood.calories) * weight) / 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            {doctor.logo_url ? (
              <img src={doctor.logo_url} alt={doctor.name} className="h-14 w-14 rounded-2xl object-contain shadow-sm border border-border" />
            ) : (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`, color: '#fff' }}
              >
                {doctor.name.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-base text-foreground truncate">{doctor.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {doctor.document_type} {doctor.document_number} • {doctor.specialty}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center">
            <span
              className="text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              Tabela de Substituição Alimentar
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-5 pb-28">
        {/* Search */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar alimento... ex: arroz, frango, leite"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              className="pl-12 rounded-2xl h-14 bg-muted/50 border-transparent focus:border-primary/30 text-base"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSearch(false); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <AnimatePresence>
            {showSearch && filteredFoods.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="absolute z-50 w-full mt-1.5">
                <Card className="rounded-2xl shadow-xl border max-h-72 overflow-y-auto">
                  <CardContent className="p-1.5">
                    {filteredFoods.map(food => {
                      const cat = categories.find(c => c.id === food.category_id);
                      return (
                        <button
                          key={food.id}
                          onClick={() => selectFood(food)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted text-left transition-colors min-h-[48px]"
                        >
                          <span className="text-xl">{cat?.icon || '🍽️'}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{food.name_short}</p>
                            <p className="text-xs text-muted-foreground">{cat?.name}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{food.calories} kcal</span>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Foods */}
        {!selectedFood && recentFoods.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Buscados recentemente</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {recentFoods.map(f => (
                <button key={f.id} onClick={() => selectRecentFood(f.id)} className="text-xs px-3 py-2 rounded-full bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors min-h-[40px]">
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Grid */}
        {!selectedFood && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map(cat => {
              const isExpanded = expandedCategory === cat.id;
              const count = foodsByCategory[cat.id]?.length || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                  className="rounded-2xl p-4 text-center transition-all duration-200 border min-h-[100px]"
                  style={{
                    background: `linear-gradient(135deg, ${cat.color}12, ${cat.color}08)`,
                    borderColor: isExpanded ? `${cat.color}60` : `${cat.color}20`,
                  }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-2" style={{ backgroundColor: `${cat.color}18` }}>
                    {cat.icon}
                  </div>
                  <p className="text-xs font-semibold text-foreground leading-tight">{cat.name}</p>
                  <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                    {count} {count === 1 ? 'item' : 'itens'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Expanded category foods */}
        <AnimatePresence>
          {!selectedFood && expandedCategory && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
              <Card className="rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-2 max-h-64 overflow-y-auto">
                  {(foodsByCategory[expandedCategory] || []).map(food => (
                    <button key={food.id} onClick={() => selectFood(food)} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted text-left transition-colors min-h-[48px]">
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected food */}
        <AnimatePresence>
          {selectedFood && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-4">
              {/* Food card */}
              <Card className="rounded-2xl shadow-sm overflow-hidden" style={{ borderLeft: `4px solid ${primaryColor}` }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: `${selectedCategory?.color || primaryColor}15` }}>
                        {selectedCategory?.icon || '🍽️'}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{selectedFood.name_short}</p>
                        <p className="text-xs text-muted-foreground">{selectedFood.preparation}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Fonte: {selectedFood.source}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedFood(null); setResults([]); }} className="text-xs text-muted-foreground">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {[
                      { label: 'Prot', value: `${selectedFood.protein}g`, bg: '#3B82F620', text: '#3B82F6' },
                      { label: 'Carb', value: `${selectedFood.carbohydrates}g`, bg: '#F59E0B20', text: '#F59E0B' },
                      { label: 'Gord', value: `${selectedFood.fat}g`, bg: '#EF444420', text: '#EF4444' },
                      { label: 'Kcal', value: `${selectedFood.calories}`, bg: '#8B5CF620', text: '#8B5CF6' },
                    ].map(m => (
                      <span key={m.label} className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: m.bg, color: m.text }}>
                        {m.label}: {m.value}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weight input */}
              <Card className="rounded-2xl shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <p className="text-sm font-semibold text-foreground">Quantidade</p>
                  <div className="flex items-center justify-center gap-3">
                    <Input
                      type="number"
                      value={weight}
                      onChange={e => setWeight(Math.max(10, Math.min(500, Number(e.target.value))))}
                      className="text-3xl font-bold text-center rounded-2xl h-16 w-32 border-2 focus:border-primary/40"
                      min={10} max={500}
                    />
                    <span className="text-xl text-muted-foreground font-semibold">g</span>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {QUICK_WEIGHTS.map(w => (
                      <button
                        key={w}
                        onClick={() => setWeight(w)}
                        className="px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 min-h-[44px]"
                        style={{
                          backgroundColor: weight === w ? primaryColor : `${primaryColor}10`,
                          color: weight === w ? '#fff' : primaryColor,
                          boxShadow: weight === w ? `0 2px 10px ${primaryColor}40` : undefined,
                        }}
                      >
                        {w}g
                      </button>
                    ))}
                  </div>
                  <Slider value={[weight]} onValueChange={v => setWeight(v[0])} min={10} max={500} step={5} />
                </CardContent>
              </Card>

              {/* Find button - desktop */}
              <div className="hidden md:block">
                <Button onClick={findSubstitutions} className="w-full rounded-2xl h-14 text-base font-bold shadow-lg" style={{ backgroundColor: primaryColor }} disabled={computing}>
                  {computing && <Loader2 className="animate-spin mr-2 h-5 w-5" />}
                  Encontrar Substituições
                </Button>
              </div>

              {/* Skeleton loading */}
              {computing && (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-11 h-11 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4 rounded-lg" />
                          <Skeleton className="h-3 w-1/2 rounded-lg" />
                        </div>
                      </div>
                      <Skeleton className="h-12 w-24 rounded-xl mx-auto" />
                      <div className="flex gap-2 justify-center">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Results */}
              {!computing && results.length > 0 && (
                <div className="space-y-3">
                  {/* Category filter chips */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                    <button
                      onClick={() => setCategoryFilter(null)}
                      className="text-xs px-3 py-2 rounded-full font-medium transition-all whitespace-nowrap min-h-[36px]"
                      style={{
                        backgroundColor: !categoryFilter ? primaryColor : `${primaryColor}10`,
                        color: !categoryFilter ? '#fff' : primaryColor,
                      }}
                    >
                      Todas categorias
                    </button>
                    {categories.filter(c => results.some(r => r.food.category_id === c.id)).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
                        className="text-xs px-3 py-2 rounded-full font-medium transition-all whitespace-nowrap min-h-[36px] flex items-center gap-1"
                        style={{
                          backgroundColor: categoryFilter === cat.id ? primaryColor : `${primaryColor}10`,
                          color: categoryFilter === cat.id ? '#fff' : primaryColor,
                        }}
                      >
                        <span>{cat.icon}</span> {cat.name}
                      </button>
                    ))}
                  </div>

                  <p className="text-sm font-medium text-muted-foreground">
                    {filteredResults.length} substituições encontradas
                  </p>

                  {filteredResults.length === 0 && (
                    <Card className="rounded-2xl shadow-sm">
                      <CardContent className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">Nenhuma substituição nesta categoria.</p>
                      </CardContent>
                    </Card>
                  )}

                  {filteredResults.slice(0, 6).map((result, idx) => {
                    const sim = getSimilarityPill(result.similarityScore);
                    const borderColor = getSimilarityBorderColor(result.similarityScore);
                    const isExpanded = expandedCards.has(result.food.id);

                    const macros = [
                      { label: 'Calorias', value: result.calories, orig: origCal, unit: 'kcal' },
                      { label: 'Proteína', value: result.protein, orig: origProt, unit: 'g' },
                      { label: 'Carboidrato', value: result.carbohydrates, orig: origCarb, unit: 'g' },
                      { label: 'Gordura', value: result.fat, orig: origFat, unit: 'g' },
                    ];

                    return (
                      <motion.div key={result.food.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05, duration: 0.25 }}>
                        <Card className="rounded-2xl shadow-sm overflow-hidden" style={{ borderLeft: `4px solid ${borderColor}` }}>
                          <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: result.category?.color ? `${result.category.color}18` : '#f1f5f9' }}>
                                {result.category?.icon || '🍽️'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground">{result.food.name_short}</p>
                                <p className="text-xs text-muted-foreground">{result.food.preparation}</p>
                              </div>
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: sim.bg, color: sim.text }}>
                                {sim.label}
                              </span>
                            </div>

                            {/* Prominent weight */}
                            <div className="text-center my-4">
                              <span className="text-5xl font-extrabold tracking-tight" style={{ color: primaryColor }}>
                                {result.equivalentWeight}
                              </span>
                              <span className="text-lg font-semibold text-muted-foreground ml-1">g</span>
                              <p className="text-xs text-muted-foreground mt-0.5">equivalente a {weight}g de {selectedFood.name_short}</p>
                            </div>

                            {/* Comparison badges */}
                            <div className="flex gap-1.5 flex-wrap justify-center">
                              {macros.map(m => {
                                const badge = compareBadge(m.value, m.orig);
                                return (
                                  <span
                                    key={m.label}
                                    className="text-[11px] px-2.5 py-1.5 rounded-full font-semibold flex items-center gap-1 bg-muted"
                                  >
                                    <span style={{ color: badge.color, fontWeight: 800 }}>{badge.icon}</span>
                                    {m.label}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Ver detalhes */}
                            <button
                              onClick={() => toggleCard(result.food.id)}
                              className="w-full flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground mt-3 py-1 transition-colors min-h-[36px]"
                            >
                              {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="border-t border-border pt-3 mt-1">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="text-muted-foreground">
                                          <th className="text-left pb-1.5 font-medium">Nutriente</th>
                                          <th className="text-right pb-1.5 font-medium">Original ({weight}g)</th>
                                          <th className="text-right pb-1.5 font-medium">Substituto ({result.equivalentWeight}g)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {macros.map(m => (
                                          <tr key={m.label} className="border-t border-border/30">
                                            <td className="py-1.5 text-foreground font-medium">{m.label}</td>
                                            <td className="py-1.5 text-right text-muted-foreground">{Math.round(m.orig * 10) / 10} {m.unit}</td>
                                            <td className="py-1.5 text-right text-foreground font-semibold">{m.value} {m.unit}</td>
                                          </tr>
                                        ))}
                                        <tr className="border-t border-border/30">
                                          <td className="py-1.5 text-foreground font-medium">Fibra</td>
                                          <td className="py-1.5 text-right text-muted-foreground">{Math.round(Number(selectedFood.fiber) * weight / 100 * 10) / 10} g</td>
                                          <td className="py-1.5 text-right text-foreground font-semibold">{Math.round(Number(result.food.fiber) * result.equivalentWeight / 100 * 10) / 10} g</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <p className="text-[10px] text-muted-foreground mt-2">Fonte: TACO 4ª Ed. - NEPA/UNICAMP</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}

                  {/* Empty state for filtered */}

                  {/* Disclaimer */}
                  <div className="flex items-start gap-2.5 bg-muted/60 rounded-2xl p-4 mt-4">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      ⚠️ As substituições são calculadas com base na Tabela TACO (NEPA/UNICAMP). Consulte sempre seu médico ou nutricionista.
                    </p>
                  </div>
                </div>
              )}

              {/* Empty state - no results */}
              {!computing && results.length === 0 && selectedFood && weight > 0 && (
                <div /> // placeholder — results appear after clicking the button
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sticky mobile button */}
      <AnimatePresence>
        {showStickyButton && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent md:hidden z-40"
          >
            <Button onClick={findSubstitutions} className="w-full rounded-2xl h-14 text-base font-bold shadow-xl" style={{ backgroundColor: primaryColor }} disabled={computing}>
              {computing && <Loader2 className="animate-spin mr-2 h-5 w-5" />}
              Encontrar Substituições
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-4 text-center">
        <p className="text-xs text-muted-foreground">{doctor.name} • {doctor.document_type} {doctor.document_number}</p>
        {doctor.phone && <p className="text-xs text-muted-foreground mt-0.5">📞 {doctor.phone}</p>}
        <p className="text-[10px] text-muted-foreground mt-1">Powered by <span className="font-semibold text-foreground">Altfood</span></p>
      </footer>
    </div>
  );
}
