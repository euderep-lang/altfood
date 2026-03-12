import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Loader2, X, Clock, AlertTriangle, ChevronDown, ChevronUp, Leaf, MessageCircle, Star, History, Heart, WifiOff, Download, Trash2, GitCompare, Info } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { calculateSubstitutions, getSimilarityLabel, type SubstitutionResult } from '@/lib/substitutionAlgorithm';
import FoodDetailModal from '@/components/FoodDetailModal';
import FoodComparisonModal from '@/components/FoodComparisonModal';
import type { Database } from '@/integrations/supabase/types';

type Food = Database['public']['Tables']['foods']['Row'];
type FoodCategory = Database['public']['Tables']['food_categories']['Row'];
type Doctor = Database['public']['Tables']['doctors']['Row'];

const QUICK_WEIGHTS = [50, 100, 150, 200, 250, 300];
const RECENT_FOODS_KEY = 'altfood_recent_foods';
const FAVORITES_KEY = 'altfood_favorites';
const VISIT_COUNT_KEY = 'altfood_visit_count';
const INSTALL_DISMISSED_KEY = 'altfood_install_dismissed';

// --- localStorage helpers ---
function getRecentFoods(): { id: string; name: string }[] {
  try { return JSON.parse(localStorage.getItem(RECENT_FOODS_KEY) || '[]').slice(0, 5); }
  catch { return []; }
}
function addRecentFood(food: Food) {
  const recent = getRecentFoods().filter(f => f.id !== food.id);
  recent.unshift({ id: food.id, name: food.name_short });
  localStorage.setItem(RECENT_FOODS_KEY, JSON.stringify(recent.slice(0, 5)));
}

interface FavoriteItem {
  foodId: string;
  foodName: string;
  originalFoodName: string;
  equivalentWeight: number;
  originalWeight: number;
  savedAt: string;
}

function getFavorites(): FavoriteItem[] {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); }
  catch { return []; }
}
function addFavorite(item: FavoriteItem) {
  const favs = getFavorites().filter(f => f.foodId !== item.foodId || f.originalFoodName !== item.originalFoodName);
  favs.unshift(item);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs.slice(0, 50)));
}
function removeFavorite(foodId: string, originalFoodName: string) {
  const favs = getFavorites().filter(f => !(f.foodId === foodId && f.originalFoodName === originalFoodName));
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}
function isFavorited(foodId: string, originalFoodName: string): boolean {
  return getFavorites().some(f => f.foodId === foodId && f.originalFoodName === originalFoodName);
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

function vibrate(ms = 10) {
  try { navigator.vibrate?.(ms); } catch {}
}

// --- Swipeable Card ---
function SwipeableCard({ children, onSwipeRight }: { children: React.ReactNode; onSwipeRight: () => void }) {
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [0, 80], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 80) {
      onSwipeRight();
      vibrate(20);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <motion.div
        className="absolute inset-0 flex items-center pl-5 rounded-2xl"
        style={{ opacity: bgOpacity, backgroundColor: '#22c55e20' }}
      >
        <Heart className="w-6 h-6 text-green-500" />
        <span className="ml-2 text-sm font-semibold text-green-600">Favoritar</span>
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}

type Tab = 'search' | 'favorites' | 'history';

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
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [favorites, setFavorites] = useState(getFavorites);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [detailFood, setDetailFood] = useState<Food | null>(null);
  const [compareSelection, setCompareSelection] = useState<Food[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

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

  const { data: allFoods = [], refetch: refetchFoods } = useQuery({
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

  const foods = useMemo(() => allFoods.filter(f => !hiddenFoodIds.includes(f.id)), [allFoods, hiddenFoodIds]);

  // Track page view
  useEffect(() => {
    if (doctor) {
      const referrer = document.referrer || '';
      let source = 'direct';
      if (referrer.includes('whatsapp') || referrer.includes('wa.me')) source = 'whatsapp';
      else if (referrer.includes('instagram') || referrer.includes('ig.me')) source = 'instagram';
      else if (referrer.includes('facebook') || referrer.includes('fb.me')) source = 'facebook';
      else if (referrer.includes('google')) source = 'google';
      else if (referrer && !referrer.includes(window.location.hostname)) source = 'other';

      supabase.from('page_views').insert({
        doctor_id: doctor.id,
        ip_hash: 'anonymous',
        user_agent: navigator.userAgent,
        referrer: source,
      });
    }
  }, [doctor]);

  // Set doctor primary color
  useEffect(() => {
    if (doctor) document.documentElement.style.setProperty('--doctor-primary', doctor.primary_color);
    return () => { document.documentElement.style.removeProperty('--doctor-primary'); };
  }, [doctor]);

  // Offline detection
  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Track visit count for install banner
    const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10) + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(count));
    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (count >= 2 && !dismissed) {
      setTimeout(() => setShowInstallBanner(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    setShowInstallBanner(false);
    vibrate(15);
  };

  const dismissInstall = () => {
    setShowInstallBanner(false);
    localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
  };

  // Pull to refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - touchStartY.current;
    if (diff > 100 && mainRef.current && mainRef.current.scrollTop <= 0) {
      setIsRefreshing(true);
      vibrate(10);
      await refetchFoods();
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // SEO meta tags
  useEffect(() => {
    if (doctor) {
      document.title = `Substituições Alimentares - Dr(a). ${doctor.name} | Altfood`;
      const setMeta = (property: string, content: string) => {
        let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!tag) { tag = document.createElement('meta'); tag.setAttribute('property', property); document.head.appendChild(tag); }
        tag.content = content;
      };
      setMeta('og:title', `Substituições Alimentares - Dr(a). ${doctor.name}`);
      setMeta('og:description', (doctor as any).bio || `Encontre substituições alimentares seguras com ${doctor.name}`);
      setMeta('og:type', 'website');
      setMeta('og:url', window.location.href);
    }
    return () => { document.title = 'Altfood'; };
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
    setActiveTab('search');
    vibrate(10);
  }, []);

  const selectRecentFood = useCallback((id: string) => {
    const food = foods.find(f => f.id === id);
    if (food) selectFood(food);
  }, [foods, selectFood]);

  const findSubstitutions = () => {
    if (!selectedFood) return;
    setComputing(true);
    vibrate(15);
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
    vibrate(5);
  };

  const toggleFavorite = (result: SubstitutionResult) => {
    if (!selectedFood) return;
    const key = { foodId: result.food.id, originalFoodName: selectedFood.name_short };
    if (isFavorited(result.food.id, selectedFood.name_short)) {
      removeFavorite(result.food.id, selectedFood.name_short);
    } else {
      addFavorite({
        foodId: result.food.id,
        foodName: result.food.name_short,
        originalFoodName: selectedFood.name_short,
        equivalentWeight: result.equivalentWeight,
        originalWeight: weight,
        savedAt: new Date().toISOString(),
      });
    }
    setFavorites(getFavorites());
    vibrate(15);
  };

  const clearFavorites = () => {
    localStorage.removeItem(FAVORITES_KEY);
    setFavorites([]);
    vibrate(10);
  };

  if (loadingDoctor) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-1/2 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-6 w-48 rounded-full mx-auto" />
          </div>
        </header>
        <main className="max-w-lg mx-auto p-4 space-y-5">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        </main>
      </div>
    );
  }

  if (doctorError || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Leaf className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Esta página não existe</h1>
            <p className="text-sm text-muted-foreground mt-2">O link que você acessou não foi encontrado ou foi removido.</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Quer criar a sua?</p>
            <Link to="/signup"><Button className="rounded-xl h-11 px-8 bg-primary hover:bg-primary/90">Criar minha conta grátis</Button></Link>
          </div>
          <p className="text-[10px] text-muted-foreground">Powered by <span className="font-semibold text-foreground">Altfood</span></p>
        </div>
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
      {/* Offline banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500 text-white text-center overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 py-2 px-4">
              <WifiOff className="w-4 h-4" />
              <span className="text-xs font-medium">Você está offline — mostrando versão salva</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 48 }}
            exit={{ height: 0 }}
            className="flex items-center justify-center bg-muted overflow-hidden"
          >
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="ml-2 text-xs text-muted-foreground">Atualizando...</span>
          </motion.div>
        )}
      </AnimatePresence>

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
              {(doctor as any).whatsapp_link && (
                <a href={(doctor as any).whatsapp_link} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm" style={{ backgroundColor: '#25D36620', color: '#25D366' }}>
                  💬
                </a>
              )}
              {(doctor as any).instagram_link && (
                <a href={(doctor as any).instagram_link} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm bg-pink-50 text-pink-600">
                  📷
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
              Tabela de Substituição Alimentar
            </span>
          </div>
        </div>
      </header>

      <main
        ref={mainRef}
        className="max-w-lg mx-auto p-4 space-y-5 pb-36"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* === SEARCH TAB === */}
        {activeTab === 'search' && (
          <>
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

              {/* Search history chips */}
              {showSearch && !searchQuery && recentFoods.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recentes</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {recentFoods.map(f => (
                      <button key={f.id} onClick={() => selectRecentFood(f.id)}
                        className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors">
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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

            {/* Recent Foods (when no food selected) */}
            {!selectedFood && !showSearch && recentFoods.length > 0 && (
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
                      onClick={() => { setExpandedCategory(isExpanded ? null : cat.id); vibrate(5); }}
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
                      {(foodsByCategory[expandedCategory] || []).map(food => {
                        const cat = categories.find(c => c.id === food.category_id);
                        return (
                          <div key={food.id} className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-muted transition-colors min-h-[48px]">
                            <button onClick={() => selectFood(food)} className="flex-1 flex items-center gap-3 text-left min-w-0">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground">{food.name_short}</p>
                                <p className="text-xs text-muted-foreground">{food.preparation}</p>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{food.calories} kcal</span>
                            </button>
                            <button onClick={() => setDetailFood(food)} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors shrink-0" title="Ver detalhes">
                              <Info className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        );
                      })}
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
                            onClick={() => { setWeight(w); vibrate(5); }}
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
                        <span className="text-[10px] ml-2 text-muted-foreground/60">← deslize para favoritar</span>
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
                        const isFav = isFavorited(result.food.id, selectedFood.name_short);

                        const macros = [
                          { label: 'Calorias', value: result.calories, orig: origCal, unit: 'kcal' },
                          { label: 'Proteína', value: result.protein, orig: origProt, unit: 'g' },
                          { label: 'Carboidrato', value: result.carbohydrates, orig: origCarb, unit: 'g' },
                          { label: 'Gordura', value: result.fat, orig: origFat, unit: 'g' },
                        ];

                        return (
                          <motion.div key={result.food.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05, duration: 0.25 }}>
                            <SwipeableCard onSwipeRight={() => toggleFavorite(result)}>
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
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => toggleFavorite(result)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                                        <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                                      </button>
                                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: sim.bg, color: sim.text }}>
                                        {sim.label}
                                      </span>
                                    </div>
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
                                        <span key={m.label} className="text-[11px] px-2.5 py-1.5 rounded-full font-semibold flex items-center gap-1 bg-muted">
                                          <span style={{ color: badge.color, fontWeight: 800 }}>{badge.icon}</span>
                                          {m.label}
                                        </span>
                                      );
                                    })}
                                  </div>

                                  {/* Actions row */}
                                  <div className="flex items-center justify-center gap-2 mt-3">
                                    <button
                                      onClick={() => setDetailFood(result.food)}
                                      className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 py-1 px-2 rounded-lg hover:bg-primary/5 transition-colors min-h-[36px]"
                                    >
                                      <Info className="w-3.5 h-3.5" /> Detalhes
                                    </button>
                                    <span className="text-muted-foreground/30">|</span>
                                    <button
                                      onClick={() => {
                                        const isSelected = compareSelection.some(c => c.id === result.food.id);
                                        if (isSelected) {
                                          setCompareSelection(prev => prev.filter(c => c.id !== result.food.id));
                                        } else if (compareSelection.length < 2) {
                                          const next = [...compareSelection, result.food];
                                          setCompareSelection(next);
                                          if (next.length === 2) setShowComparison(true);
                                        }
                                        vibrate(5);
                                      }}
                                      className={`flex items-center gap-1 text-xs font-medium py-1 px-2 rounded-lg transition-colors min-h-[36px] ${
                                        compareSelection.some(c => c.id === result.food.id)
                                          ? 'text-primary bg-primary/10'
                                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                      }`}
                                    >
                                      <GitCompare className="w-3.5 h-3.5" /> Comparar
                                    </button>
                                    <span className="text-muted-foreground/30">|</span>
                                    <button
                                      onClick={() => toggleCard(result.food.id)}
                                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground py-1 px-2 rounded-lg hover:bg-muted transition-colors min-h-[36px]"
                                    >
                                      {isExpanded ? 'Ocultar' : 'Nutrientes'}
                                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>

                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
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
                            </SwipeableCard>
                          </motion.div>
                        );
                      })}

                      {/* Disclaimer */}
                      <div className="flex items-start gap-2.5 bg-muted/60 rounded-2xl p-4 mt-4">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          ⚠️ As substituições são calculadas com base na Tabela TACO (NEPA/UNICAMP). Consulte sempre seu médico ou nutricionista.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {!computing && results.length === 0 && selectedFood && weight > 0 && <div />}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* === FAVORITES TAB === */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">⭐ Favoritos</h2>
              {favorites.length > 0 && (
                <button onClick={clearFavorites} className="text-xs text-destructive flex items-center gap-1 hover:underline">
                  <Trash2 className="w-3 h-3" /> Limpar tudo
                </button>
              )}
            </div>
            {favorites.length === 0 ? (
              <Card className="rounded-2xl">
                <CardContent className="p-8 text-center">
                  <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Nenhum favorito salvo</p>
                  <p className="text-xs text-muted-foreground mt-1">Deslize para a direita nos resultados ou toque no ❤️ para salvar</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {favorites.map((fav, i) => (
                  <motion.div key={`${fav.foodId}-${fav.originalFoodName}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="rounded-2xl shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-foreground text-sm">{fav.foodName}</p>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-semibold" style={{ color: primaryColor }}>{fav.equivalentWeight}g</span> substitui {fav.originalWeight}g de {fav.originalFoodName}
                            </p>
                          </div>
                          <button
                            onClick={() => { removeFavorite(fav.foodId, fav.originalFoodName); setFavorites(getFavorites()); vibrate(10); }}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === HISTORY TAB === */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">📋 Histórico</h2>
            {recentFoods.length === 0 ? (
              <Card className="rounded-2xl">
                <CardContent className="p-8 text-center">
                  <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Nenhuma busca recente</p>
                  <p className="text-xs text-muted-foreground mt-1">Suas últimas 5 buscas aparecerão aqui</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {recentFoods.map((f, i) => (
                  <motion.div key={f.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <button
                      onClick={() => { selectRecentFood(f.id); setActiveTab('search'); }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card border border-border hover:bg-muted transition-colors text-left"
                    >
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium text-foreground">{f.name}</span>
                      <Search className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Sticky find button */}
        <AnimatePresence>
          {showStickyButton && activeTab === 'search' && (
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="px-4 pb-2 bg-gradient-to-t from-background via-background to-transparent"
            >
              <Button onClick={findSubstitutions} className="w-full rounded-2xl h-14 text-base font-bold shadow-xl" style={{ backgroundColor: primaryColor }} disabled={computing}>
                {computing && <Loader2 className="animate-spin mr-2 h-5 w-5" />}
                Encontrar Substituições
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav bar */}
        <nav className="bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
          <div className="max-w-lg mx-auto flex">
            {([
              { id: 'search' as Tab, icon: '🔍', label: 'Buscar' },
              { id: 'favorites' as Tab, icon: '⭐', label: 'Favoritos' },
              { id: 'history' as Tab, icon: '📋', label: 'Histórico' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); vibrate(5); }}
                className={`flex-1 flex flex-col items-center py-3 transition-colors ${activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className={`text-[10px] mt-0.5 font-medium ${activeTab === tab.id ? 'font-bold' : ''}`}>
                  {tab.label}
                  {tab.id === 'favorites' && favorites.length > 0 && (
                    <span className="ml-0.5 text-[9px] bg-red-500 text-white px-1 rounded-full">{favorites.length}</span>
                  )}
                </span>
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-indicator" className="w-5 h-0.5 rounded-full mt-1" style={{ backgroundColor: primaryColor }} />
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Install PWA banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-20 left-4 right-4 z-50 md:hidden"
          >
            <Card className="rounded-2xl shadow-xl border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                    <Download className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Adicione à tela inicial</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Acesso rápido ao Altfood sem abrir o navegador</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={handleInstall} size="sm" className="flex-1 rounded-xl h-9 text-xs" style={{ backgroundColor: primaryColor }}>
                    Adicionar
                  </Button>
                  <Button onClick={dismissInstall} variant="ghost" size="sm" className="rounded-xl h-9 text-xs text-muted-foreground">
                    Agora não
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp button */}
      {(doctor as any).whatsapp_link && (
        <a
          href={`${(doctor as any).whatsapp_link}${(doctor as any).whatsapp_link.includes('?') ? '&' : '?'}text=${encodeURIComponent(`Olá Dr(a). ${doctor.name.split(' ')[0]}, vim pelo Altfood e tenho uma dúvida.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 md:bottom-6 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
          style={{ backgroundColor: '#25D366' }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </a>
      )}

      {/* Comparison banner */}
      <AnimatePresence>
        {compareSelection.length > 0 && compareSelection.length < 2 && (
          <motion.div
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4"
          >
            <Card className="rounded-2xl shadow-xl border-primary/20">
              <CardContent className="p-3 flex items-center gap-3">
                <GitCompare className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {compareSelection[0].name_short} selecionado
                  </p>
                  <p className="text-xs text-muted-foreground">Selecione mais 1 alimento para comparar</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCompareSelection([])} className="shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <FoodDetailModal
        food={detailFood}
        open={!!detailFood}
        onClose={() => setDetailFood(null)}
        categoryIcon={detailFood ? categories.find(c => c.id === detailFood.category_id)?.icon : undefined}
        categoryColor={detailFood ? categories.find(c => c.id === detailFood.category_id)?.color : undefined}
        doctorName={doctor.name}
      />
      <FoodComparisonModal
        foods={compareSelection.length === 2 ? [compareSelection[0], compareSelection[1]] : null}
        open={showComparison}
        onClose={() => { setShowComparison(false); setCompareSelection([]); }}
      />

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-4 text-center mb-16 md:mb-0">
        <p className="text-xs text-muted-foreground">{doctor.name} • {doctor.document_type} {doctor.document_number}</p>
        {doctor.phone && <p className="text-xs text-muted-foreground mt-0.5">📞 {doctor.phone}</p>}
        <p className="text-[10px] text-muted-foreground mt-2">
          Powered by{' '}
          <Link to="/" className="font-semibold text-foreground hover:text-primary transition-colors">Altfood</Link>
        </p>
      </footer>
    </div>
  );
}
