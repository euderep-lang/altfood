import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Loader2, X, ChevronDown, ChevronUp, Info, ArrowRight, MessageCircle } from 'lucide-react';
import AltfoodIcon from '@/components/AltfoodIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateSubstitutions, getSimilarityLabel, type SubstitutionResult } from '@/lib/substitutionAlgorithm';
import FoodDetailModal from '@/components/FoodDetailModal';
import PatientFeedback from '@/components/PatientFeedback';
import { t, getSavedLang, saveLang, type Lang } from '@/lib/i18n';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Food = Database['public']['Tables']['foods']['Row'];
type FoodCategory = Database['public']['Tables']['food_categories']['Row'];
type Doctor = Database['public']['Tables']['doctors']['Row'];

const QUICK_WEIGHTS = [50, 100, 150, 200, 250, 300];

export default function PatientPage() {
  const { slug: urlSlug, profileSlug } = useParams<{ slug: string; profileSlug?: string }>();
  const slug = urlSlug || 'altfood';
  const [searchQuery, setSearchQuery] = useState('');
  const [substitutionQuery, setSubstitutionQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [weight, setWeight] = useState(100);
  const [results, setResults] = useState<SubstitutionResult[]>([]);
  const [computing, setComputing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSubSearch, setShowSubSearch] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [detailFood, setDetailFood] = useState<Food | null>(null);
  const [searchCount, setSearchCount] = useState(0);
  const [lang, setLang] = useState<Lang>(getSavedLang);
  const searchRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: doctor, isLoading: loadingDoctor, error: doctorError } = useQuery({
    queryKey: ['doctor-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('doctors').select('*').eq('slug', slug).single();
      if (error && slug === 'altfood') {
        return {
          id: '00000000-0000-0000-0000-000000000000', name: 'Altfood', slug: 'altfood',
          primary_color: '#0EA5E9', bio: 'Encontre substituições alimentares seguras.',
          onboarding_completed: true, theme_layout: 'minimal',
        } as unknown as Doctor;
      }
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

  const { data: allFoods = [] } = useQuery({
    queryKey: ['foods'],
    queryFn: async () => {
      const { data } = await supabase.from('foods').select('*').eq('is_active', true).order('name_short');
      return (data || []) as Food[];
    },
  });

  const { data: hiddenFoodIds = [] } = useQuery({
    queryKey: ['hidden-foods-patient', doctor?.id],
    queryFn: async () => {
      if (!doctor) return [];
      const { data } = await supabase.from('hidden_foods').select('food_id').eq('doctor_id', doctor.id);
      return (data || []).map((r: any) => r.food_id as string);
    },
    enabled: !!doctor,
  });

  // Fetch profile-specific hidden foods if profileSlug is present
  const { data: profileHiddenIds = [] } = useQuery({
    queryKey: ['profile-hidden-foods', doctor?.id, profileSlug],
    queryFn: async () => {
      if (!doctor || !profileSlug) return [];
      const { data } = await supabase
        .from('patient_profiles')
        .select('hidden_food_ids')
        .eq('doctor_id', doctor.id)
        .eq('slug_suffix', profileSlug)
        .single();
      return (data?.hidden_food_ids as string[]) || [];
    },
    enabled: !!doctor && !!profileSlug,
  });

  const { data: doctorSections = [] } = useQuery({
    queryKey: ['doctor-sections', doctor?.id],
    queryFn: async () => {
      if (!doctor) return [];
      const { data } = await supabase.from('doctor_sections').select('*').eq('doctor_id', doctor.id).order('sort_order');
      return data || [];
    },
    enabled: !!doctor,
  });

  const foods = useMemo(() => allFoods.filter(f => !hiddenFoodIds.includes(f.id)), [allFoods, hiddenFoodIds]);

  const toggleLang = () => { const n = lang === 'pt' ? 'en' : 'pt'; setLang(n); saveLang(n); };

  // Track page view
  useEffect(() => {
    if (doctor) {
      const raw = navigator.userAgent + new Date().toDateString();
      const hash = btoa(raw).slice(0, 16);
      supabase.from('page_views').insert({ doctor_id: doctor.id, ip_hash: hash, user_agent: navigator.userAgent, referrer: document.referrer || 'direct' });
    }
  }, [doctor]);

  useEffect(() => {
    if (doctor) document.documentElement.style.setProperty('--doctor-primary', doctor.primary_color);
    return () => { document.documentElement.style.removeProperty('--doctor-primary'); };
  }, [doctor]);

  useEffect(() => {
    if (doctor) {
      document.title = `Substituições Alimentares - ${doctor.name} | Altfood`;
    }
    return () => { document.title = 'Altfood'; };
  }, [doctor]);

  // Search logic
  const matchesSearch = useCallback((food: Food, query: string): boolean => {
    const combined = `${food.name.toLowerCase()} ${food.name_short.toLowerCase()} ${food.preparation?.toLowerCase() || ''}`;
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1 && !['de', 'do', 'da', 'com', 'sem', 'em', 'no', 'na'].includes(w));
    if (words.length === 0) return false;
    return words.every(w => combined.includes(w));
  }, []);

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return [];
    // Check if query matches a category name exactly — show foods from that category
    const matchedCategory = categories.find(c => c.name.toLowerCase() === searchQuery.trim().toLowerCase());
    if (matchedCategory) {
      return foods.filter(f => f.category_id === matchedCategory.id).slice(0, 20);
    }
    return foods.filter(f => matchesSearch(f, searchQuery)).slice(0, 10);
  }, [searchQuery, foods, categories, matchesSearch]);

  const filteredSubSuggestions = useMemo(() => {
    if (!substitutionQuery.trim()) return [];
    return foods.filter(f => matchesSearch(f, substitutionQuery) && f.id !== selectedFood?.id).slice(0, 8);
  }, [substitutionQuery, foods, selectedFood, matchesSearch]);

  const selectFood = useCallback((food: Food) => {
    setSelectedFood(food);
    setSearchQuery('');
    setSubstitutionQuery('');
    setShowSearch(false);
    setShowSubSearch(false);
    setResults([]);
    setWeight(100);
    setExpandedCards(new Set());

    // Auto-trigger substitutions immediately
    setComputing(true);
    if (doctor) {
      supabase.from('substitution_queries').insert({ doctor_id: doctor.id, food_name: food.name_short, weight_grams: 100 });
    }
    const categoryName = categories.find(c => c.id === food.category_id)?.name || '';
    setTimeout(() => {
      const subs = calculateSubstitutions(food, 100, foods, categories, categoryName);
      setResults(subs);
      setComputing(false);
      setSearchCount(prev => prev + 1);
    }, 400);
  }, [doctor, foods, categories]);

  const findSpecificSubstitution = (foodToSub: Food) => {
    if (!selectedFood) return;
    setComputing(true);
    setSubstitutionQuery('');
    setShowSubSearch(false);

    const categoryName = categories.find(c => c.id === selectedFood.category_id)?.name || '';

    setTimeout(() => {
      const allSubs = calculateSubstitutions(selectedFood, weight, [foodToSub, ...foods], categories, categoryName);
      const specificSub = allSubs.find(s => s.food.id === foodToSub.id);

      if (specificSub) {
        setResults([specificSub]);
      } else {
        // Manual fallback
        const ANCHOR_MAP: Record<string, 'protein' | 'carbohydrates' | 'fat' | 'calories'> = {
          'Proteínas Animais': 'protein', 'Proteínas Vegetais': 'protein',
          'Laticínios e Derivados': 'protein', 'Carboidratos': 'carbohydrates',
          'Gorduras e Oleaginosas': 'fat', 'Frutas': 'calories',
          'Vegetais e Legumes': 'calories', 'Temperos e Condimentos': 'calories',
          'Bebidas Funcionais': 'calories', 'Suplementos Alimentares': 'protein',
        };
        const anchor = ANCHOR_MAP[categoryName] || 'calories';
        const getVal = (f: Food, n: string) => Number(n === 'protein' ? f.protein : n === 'carbohydrates' ? f.carbohydrates : n === 'fat' ? f.fat : f.calories);
        const anchorPer100 = getVal(selectedFood, anchor);
        const subAnchor = getVal(foodToSub, anchor);

        if (anchorPer100 > 0 && subAnchor > 0) {
          const targetMacro = (anchorPer100 * weight) / 100;
          const eqWeight = Math.round((targetMacro * 100) / subAnchor);
          const prot = Math.round((Number(foodToSub.protein) * eqWeight) / 100 * 10) / 10;
          const carb = Math.round((Number(foodToSub.carbohydrates) * eqWeight) / 100 * 10) / 10;
          const fat = Math.round((Number(foodToSub.fat) * eqWeight) / 100 * 10) / 10;
          const cal = Math.round((Number(foodToSub.calories) * eqWeight) / 100 * 10) / 10;
          const origProt = (Number(selectedFood.protein) * weight) / 100;
          const origCarb = (Number(selectedFood.carbohydrates) * weight) / 100;
          const origFat = (Number(selectedFood.fat) * weight) / 100;
          const total = origProt + origCarb + origFat || 1;
          const similarity = Math.max(0, 1 - (Math.abs(prot - origProt) + Math.abs(carb - origCarb) + Math.abs(fat - origFat)) / total);
          const category = categories.find(c => c.id === foodToSub.category_id);
          setResults([{
            food: foodToSub, category, equivalentWeight: eqWeight,
            protein: prot, carbohydrates: carb, fat, calories: cal,
            similarityScore: Math.round(similarity * 100) / 100,
          }]);
        } else {
          toast.error(lang === 'pt' ? 'Não foi possível calcular.' : 'Could not calculate.');
          setResults([]);
        }
      }
      setComputing(false);
      setSearchCount(prev => prev + 1);
    }, 600);
  };

  const handleFreeSearch = useCallback(() => {
    if (!substitutionQuery.trim() || !selectedFood) return;
    const bestMatch = foods.find(f => matchesSearch(f, substitutionQuery) && f.id !== selectedFood.id);
    if (bestMatch) {
      findSpecificSubstitution(bestMatch);
    } else {
      toast.error(lang === 'pt' ? 'Nenhum alimento encontrado.' : 'No food found.');
    }
  }, [substitutionQuery, selectedFood, foods, matchesSearch, lang]);

  const findSubstitutions = () => {
    if (!selectedFood) return;
    setComputing(true);
    if (doctor) {
      supabase.from('substitution_queries').insert({ doctor_id: doctor.id, food_name: selectedFood.name_short, weight_grams: weight });
    }
    const categoryName = categories.find(c => c.id === selectedFood.category_id)?.name || '';
    setTimeout(() => {
      const subs = calculateSubstitutions(selectedFood, weight, foods, categories, categoryName);
      setResults(subs);
      setComputing(false);
      setSearchCount(prev => prev + 1);
    }, 400);
  };

  // Auto-recalculate when weight changes
  useEffect(() => {
    if (!selectedFood || weight <= 0) return;
    setComputing(true);
    const categoryName = categories.find(c => c.id === selectedFood.category_id)?.name || '';
    const timer = setTimeout(() => {
      const subs = calculateSubstitutions(selectedFood, weight, foods, categories, categoryName);
      setResults(subs);
      setComputing(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [weight, selectedFood, foods, categories]);

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Loading
  if (loadingDoctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-6">
          <Skeleton className="h-8 w-48 mx-auto rounded-xl" />
          <Skeleton className="h-4 w-32 mx-auto rounded-lg" />
          <Skeleton className="h-14 w-full rounded-2xl mt-8" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (doctorError || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <AltfoodIcon size="lg" className="mx-auto opacity-40" />
          <h1 className="text-xl font-bold text-foreground">Página não encontrada</h1>
          <p className="text-sm text-muted-foreground">O link acessado não foi encontrado.</p>
          <Link to="/signup"><Button className="rounded-2xl h-12 px-8">Criar minha conta grátis</Button></Link>
        </div>
      </div>
    );
  }

  const primaryColor = doctor.primary_color || '#0F766E';
  const selectedCategory = selectedFood ? categories.find(c => c.id === selectedFood.category_id) : null;

  const origProt = selectedFood ? (Number(selectedFood.protein) * weight) / 100 : 0;
  const origCarb = selectedFood ? (Number(selectedFood.carbohydrates) * weight) / 100 : 0;
  const origFat = selectedFood ? (Number(selectedFood.fat) * weight) / 100 : 0;
  const origCal = selectedFood ? (Number(selectedFood.calories) * weight) / 100 : 0;

  const getSimilarityInfo = (score: number) => {
    if (score > 0.7) return { label: t(lang, 'verySimilar'), color: '#16a34a', bg: '#22c55e15' };
    if (score > 0.4) return { label: t(lang, 'similar'), color: '#ca8a04', bg: '#eab30815' };
    return { label: t(lang, 'different'), color: '#dc2626', bg: '#ef444415' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
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
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-base text-foreground truncate">{doctor.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {doctor.document_type} {doctor.document_number} • {doctor.specialty}
              </p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={toggleLang}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm bg-muted hover:bg-muted/80 transition-colors"
                title={lang === 'pt' ? 'Switch to English' : 'Mudar para Português'}
              >
                {lang === 'pt' ? '🇺🇸' : '🇧🇷'}
              </button>
              {(doctor as any).whatsapp_link && (
                <a href={(doctor as any).whatsapp_link} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#25D36620' }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              )}
              {(doctor as any).instagram_link && (
                <a href={(doctor as any).instagram_link} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E1306C18' }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
            </div>
          </div>
          {(doctor as any).welcome_message && (
            <p className="text-sm text-muted-foreground mt-3 italic text-center">"{(doctor as any).welcome_message}"</p>
          )}
          {(doctor as any).bio && (
            <p className="text-xs text-muted-foreground mt-2 text-center">{(doctor as any).bio}</p>
          )}
          <div className="mt-3 flex items-center justify-center">
            <span className="text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
              {t(lang, 'substitutionTable')}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-6 space-y-6 pb-32">
        {/* Doctor sections */}
        {doctorSections.length > 0 && (
          <div className="space-y-2">
            {doctorSections.map((section: any) => (
              <div key={section.id} className="rounded-2xl bg-card/60 border border-border/40 px-4 py-3">
                <p className="text-xs font-semibold text-foreground">{section.title}</p>
                <p className="text-[11px] text-muted-foreground mt-1 whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              ref={searchRef}
              placeholder={t(lang, 'searchPlaceholder')}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              className="pl-11 pr-10 rounded-2xl h-13 bg-card border-border/60 focus:border-primary/40 text-sm shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSearch(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground/60" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showSearch && filteredFoods.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute z-50 w-full mt-2">
                <div className="rounded-2xl bg-card border border-border/60 shadow-2xl max-h-72 overflow-y-auto">
                  <div className="p-1">
                    {filteredFoods.map(food => {
                      const cat = categories.find(c => c.id === food.category_id);
                      return (
                        <button key={food.id} onClick={() => selectFood(food)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 text-left transition-colors">
                          <span className="text-lg">{cat?.icon || '🍽️'}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{food.name_short}</p>
                            <p className="text-[11px] text-muted-foreground">{cat?.name}</p>
                          </div>
                          <span className="text-[11px] text-muted-foreground/70">{food.calories} kcal</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category chips */}
        {!searchQuery && !selectedFood && !showSearch && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            {categories
              .slice()
              .sort((a, b) => a.sort_order - b.sort_order)
              .slice(0, 8)
              .map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSearchQuery(cat.name); setShowSearch(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-card text-xs font-medium text-muted-foreground whitespace-nowrap shrink-0 hover:bg-muted/50 transition-colors"
                  style={{ borderColor: `${primaryColor}30`, color: primaryColor }}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
          </div>
        )}

        {/* Selected Food + Weight + Results */}
        <AnimatePresence>
          {selectedFood && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">

              {/* Selected Food Card */}
              <div className="rounded-2xl bg-card border border-border/40 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${selectedCategory?.color || primaryColor}12` }}>
                      {selectedCategory?.icon || '🍽️'}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{selectedFood.name_short}</p>
                      <p className="text-[11px] text-muted-foreground">{selectedFood.preparation}</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedFood(null); setResults([]); }}
                    className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors">
                    <X className="h-4 w-4 text-muted-foreground/60" />
                  </button>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[
                    { label: 'Prot', value: `${Math.round(origProt * 10) / 10}g`, color: '#3B82F6' },
                    { label: 'Carb', value: `${Math.round(origCarb * 10) / 10}g`, color: '#F59E0B' },
                    { label: 'Gord', value: `${Math.round(origFat * 10) / 10}g`, color: '#EF4444' },
                    { label: 'Kcal', value: `${Math.round(origCal)}`, color: '#8B5CF6' },
                  ].map(m => (
                    <div key={m.label} className="text-center rounded-xl py-2" style={{ backgroundColor: `${m.color}08` }}>
                      <p className="text-[10px] text-muted-foreground font-medium">{m.label}</p>
                      <p className="text-xs font-bold" style={{ color: m.color }}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weight Selector */}
              <div className="rounded-2xl bg-card border border-border/40 p-5 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground mb-3">{t(lang, 'quantity')}</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Input
                    type="number"
                    value={weight}
                    onChange={e => setWeight(Math.max(1, Math.min(500, Number(e.target.value))))}
                    className="text-2xl font-bold text-center rounded-xl h-14 w-28 border-2 border-border/60 focus:border-primary/40"
                    min={1} max={500}
                  />
                  <span className="text-lg text-muted-foreground font-medium">g</span>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {QUICK_WEIGHTS.map(w => (
                    <button key={w} onClick={() => setWeight(w)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: weight === w ? primaryColor : `${primaryColor}08`,
                        color: weight === w ? '#fff' : primaryColor,
                      }}>
                      {w}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific substitution search */}
              <div className="relative">
                <p className="text-xs font-medium text-muted-foreground mb-2 ml-1">
                  {lang === 'pt' ? 'Substituir por alimento específico' : 'Substitute with specific food'}
                </p>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    placeholder={lang === 'pt' ? 'Ex: coxa de frango, batata doce...' : 'E.g. chicken thigh, sweet potato...'}
                    value={substitutionQuery}
                    onChange={e => { setSubstitutionQuery(e.target.value); setShowSubSearch(true); }}
                    onFocus={() => setShowSubSearch(true)}
                    onKeyDown={e => { if (e.key === 'Enter') handleFreeSearch(); }}
                    className="pl-10 pr-12 rounded-2xl h-12 bg-card border-border/60 focus:border-primary/40 text-sm shadow-sm"
                  />
                  {substitutionQuery && (
                    <button onClick={handleFreeSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showSubSearch && filteredSubSuggestions.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="absolute z-50 w-full mt-1.5">
                      <div className="rounded-2xl bg-card border border-border/60 shadow-2xl max-h-56 overflow-y-auto">
                        <div className="p-1">
                          {filteredSubSuggestions.map(food => {
                            const cat = categories.find(c => c.id === food.category_id);
                            return (
                              <button key={food.id} onClick={() => findSpecificSubstitution(food)}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted/60 text-left transition-colors">
                                <span className="text-base">{cat?.icon || '🍽️'}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-foreground truncate">{food.name_short}</p>
                                  <p className="text-[10px] text-muted-foreground">{cat?.name}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
          </div>

              {/* Loading */}
              {computing && (
                <div className="flex flex-col items-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
                  <p className="text-sm text-muted-foreground">{lang === 'pt' ? 'Calculando...' : 'Calculating...'}</p>
                </div>
              )}

              {/* Results */}
              {!computing && results.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      {results.length === 1
                        ? (lang === 'pt' ? 'Substituição encontrada' : 'Substitution found')
                        : `${results.length} ${t(lang, 'substitutionsFound')}`}
                    </p>
                    {results.length === 1 && (
                      <button onClick={findSubstitutions} className="text-xs font-semibold underline underline-offset-4" style={{ color: primaryColor }}>
                        {lang === 'pt' ? 'Ver todas' : 'See all'}
                      </button>
                    )}
                  </div>

                  {results.slice(0, 20).map((result, idx) => {
                    const sim = getSimilarityInfo(result.similarityScore);
                    const isExpanded = expandedCards.has(result.food.id);

                    const macros = [
                      { label: t(lang, 'protein'), value: result.protein, orig: origProt, unit: 'g' },
                      { label: t(lang, 'carbs'), value: result.carbohydrates, orig: origCarb, unit: 'g' },
                      { label: t(lang, 'fat'), value: result.fat, orig: origFat, unit: 'g' },
                      { label: t(lang, 'calories'), value: result.calories, orig: origCal, unit: 'kcal' },
                    ];

                    return (
                      <motion.div key={result.food.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.2 }}>
                        <div className="rounded-2xl bg-card border border-border/40 overflow-hidden shadow-sm"
                          style={{ borderLeftWidth: 3, borderLeftColor: sim.color }}>
                          <div className="p-4">
                            {/* Header */}
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                                style={{ backgroundColor: result.category?.color ? `${result.category.color}12` : '#f8fafc' }}>
                                {result.category?.icon || '🍽️'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground text-sm">{result.food.name_short}</p>
                                <p className="text-[11px] text-muted-foreground">{result.food.preparation}</p>
                              </div>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                                style={{ backgroundColor: sim.bg, color: sim.color }}>
                                {sim.label}
                              </span>
                            </div>

                            {/* Weight */}
                            <div className="text-center mt-4 mb-3">
                              <span className="text-4xl font-extrabold tracking-tight" style={{ color: primaryColor }}>
                                {result.equivalentWeight}
                              </span>
                              <span className="text-base font-medium text-muted-foreground ml-1">g</span>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {t(lang, 'equivalent')} {weight}g {t(lang, 'of')} {selectedFood.name_short}
                              </p>
                            </div>

                            {/* Quick macro pills */}
                            <div className="flex gap-1 justify-center flex-wrap">
                              {macros.map(m => (
                                <span key={m.label} className="text-[10px] px-2 py-1 rounded-full bg-muted/60 text-muted-foreground font-medium">
                                  {m.label}: {m.value}{m.unit}
                                </span>
                              ))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-border/30">
                              <button onClick={() => setDetailFood(result.food)}
                                className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors">
                                <Info className="w-3.5 h-3.5" /> {t(lang, 'details')}
                              </button>
                              <span className="text-border">·</span>
                              <button onClick={() => toggleCard(result.food.id)}
                                className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                                {isExpanded ? t(lang, 'hide') : t(lang, 'nutrients')}
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>

                            {/* Expanded nutrients table */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                  <div className="pt-3 mt-2 border-t border-border/30">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="text-muted-foreground">
                                          <th className="text-left pb-1.5 font-medium">{t(lang, 'nutrient')}</th>
                                          <th className="text-right pb-1.5 font-medium">{t(lang, 'original')}</th>
                                          <th className="text-right pb-1.5 font-medium">{t(lang, 'substitute')}</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {macros.map(m => (
                                          <tr key={m.label} className="border-t border-border/20">
                                            <td className="py-1.5 text-foreground">{m.label}</td>
                                            <td className="py-1.5 text-right text-muted-foreground">{Math.round(m.orig * 10) / 10} {m.unit}</td>
                                            <td className="py-1.5 text-right font-medium text-foreground">{m.value} {m.unit}</td>
                                          </tr>
                                        ))}
                                        <tr className="border-t border-border/20">
                                          <td className="py-1.5 text-foreground">{t(lang, 'fiber')}</td>
                                          <td className="py-1.5 text-right text-muted-foreground">{Math.round(Number(selectedFood.fiber) * weight / 100 * 10) / 10} g</td>
                                          <td className="py-1.5 text-right font-medium text-foreground">{Math.round(Number(result.food.fiber) * result.equivalentWeight / 100 * 10) / 10} g</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <p className="text-[9px] text-muted-foreground/60 mt-2">{t(lang, 'source')}: TACO 4ª Ed.</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Disclaimer */}
                  <p className="text-[10px] text-muted-foreground/60 text-center mt-4 leading-relaxed">
                    ⚠️ Valores baseados na Tabela TACO (NEPA/UNICAMP). Consulte seu nutricionista.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* WhatsApp FAB */}
      {(doctor as any).whatsapp_link && (
        <a href={(doctor as any).whatsapp_link} target="_blank" rel="noopener noreferrer"
          className="fixed bottom-6 right-5 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          style={{ backgroundColor: '#25D366' }}>
          <MessageCircle className="w-5 h-5 text-white" />
        </a>
      )}

      {/* Food Detail Modal */}
      <FoodDetailModal
        food={detailFood}
        open={!!detailFood}
        onClose={() => setDetailFood(null)}
        categoryIcon={detailFood ? categories.find(c => c.id === detailFood.category_id)?.icon : undefined}
        categoryColor={detailFood ? categories.find(c => c.id === detailFood.category_id)?.color : undefined}
        doctorName={doctor.name}
      />

      {/* Patient feedback */}
      {doctor && <PatientFeedback doctorId={doctor.id} searchCount={searchCount} />}

      {/* Footer */}
      <footer className="border-t border-border/30 px-5 py-5 text-center">
        <p className="text-[11px] text-muted-foreground">{doctor.name} • {doctor.specialty}</p>
        <p className="text-[10px] text-muted-foreground/50 mt-2">
          Powered by{' '}
          <Link to="/" className="font-semibold text-foreground/60 hover:text-primary transition-colors">Altfood</Link>
        </p>
      </footer>
    </div>
  );
}
