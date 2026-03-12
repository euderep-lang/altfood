import { useState, useMemo, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Search, Loader2, Shield, ArrowLeft, Plus, Pencil, Trash2, Upload, ChevronLeft, ChevronRight, Star
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Food = Database['public']['Tables']['foods']['Row'];
type FoodCategory = Database['public']['Tables']['food_categories']['Row'];

const ADMIN_EMAIL = 'carine@dracarinecassol.com.br';
const PER_PAGE = 20;

const emptyFood = {
  name: '', name_short: '', preparation: '', calories: 0, protein: 0,
  carbohydrates: 0, fat: 0, fiber: 0, category_id: '', source: 'TACO 4ª Ed. - NEPA/UNICAMP',
  is_active: true,
};

export default function AdminFoods() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editFood, setEditFood] = useState<any>(null);
  const [deleteFood, setDeleteFood] = useState<Food | null>(null);
  const [saving, setSaving] = useState(false);
  const [featuredFoodId, setFeaturedFoodId] = useState<string | null>(null);

  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  const { data: foods = [], isLoading } = useQuery({
    queryKey: ['admin-foods'],
    queryFn: async () => {
      const { data } = await supabase.from('foods').select('*').order('name_short');
      return (data || []) as Food[];
    },
    enabled: isAdmin,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('food_categories').select('*').order('sort_order');
      return (data || []) as FoodCategory[];
    },
    enabled: isAdmin,
  });

  // Fetch admin doctor for featured food
  useQuery({
    queryKey: ['admin-doctor-featured', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from('doctors').select('id, featured_food_id').eq('user_id', user.id).single();
      if (data?.featured_food_id) setFeaturedFoodId(data.featured_food_id);
      return data;
    },
    enabled: isAdmin && !!user,
  });

  const toggleFeatured = async (foodId: string) => {
    if (!user) return;
    const newId = featuredFoodId === foodId ? null : foodId;
    setFeaturedFoodId(newId);
    // Update all doctors (admin sets globally)
    const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', user.id).single();
    if (doc) {
      await supabase.from('doctors').update({ featured_food_id: newId }).eq('id', doc.id);
    }
    toast({ title: newId ? '🌟 Destaque do dia definido' : 'Destaque removido' });
  };


    let list = foods;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q) || f.name_short.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'all') {
      list = list.filter(f => f.category_id === categoryFilter);
    }
    return list;
  }, [foods, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const getCategoryName = (id: string | null) => categories.find(c => c.id === id)?.name || '—';
  const getCategoryIcon = (id: string | null) => categories.find(c => c.id === id)?.icon || '🍽️';

  const openNew = () => {
    setEditFood({ ...emptyFood, _isNew: true });
    setEditOpen(true);
  };

  const openEdit = (food: Food) => {
    setEditFood({ ...food, _isNew: false });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editFood) return;
    setSaving(true);
    const { _isNew, id, ...data } = editFood;
    // Clean up numeric fields
    data.calories = Number(data.calories) || 0;
    data.protein = Number(data.protein) || 0;
    data.carbohydrates = Number(data.carbohydrates) || 0;
    data.fat = Number(data.fat) || 0;
    data.fiber = Number(data.fiber) || 0;
    if (!data.category_id) data.category_id = null;
    if (!data.name_short) data.name_short = data.name;

    if (_isNew) {
      const { error } = await supabase.from('foods').insert(data);
      if (error) {
        toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: '✅ Alimento criado' });
      }
    } else {
      const { error } = await supabase.from('foods').update(data).eq('id', id);
      if (error) {
        toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: '✅ Alimento atualizado' });
      }
    }
    setSaving(false);
    setEditOpen(false);
    queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
  };

  const handleDelete = async () => {
    if (!deleteFood) return;
    const { error } = await supabase.from('foods').delete().eq('id', deleteFood.id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Alimento excluído' });
      queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
    }
    setDeleteOpen(false);
    setDeleteFood(null);
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);

    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) {
      toast({ title: 'CSV vazio ou inválido', variant: 'destructive' });
      setImporting(false);
      return;
    }

    const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
    const nameIdx = header.indexOf('name');
    const calIdx = header.indexOf('calories');
    const protIdx = header.indexOf('protein');
    const carbIdx = header.indexOf('carbs');
    const fatIdx = header.indexOf('fat');
    const fiberIdx = header.indexOf('fiber');
    const catIdx = header.indexOf('category_name');

    if (nameIdx === -1) {
      toast({ title: 'Coluna "name" não encontrada no CSV', variant: 'destructive' });
      setImporting(false);
      return;
    }

    const rows: any[] = [];
    let errors = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
        const name = cols[nameIdx];
        if (!name) { errors++; continue; }

        const categoryName = catIdx >= 0 ? cols[catIdx] : '';
        const category = categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());

        rows.push({
          name,
          name_short: name,
          calories: Number(cols[calIdx]) || 0,
          protein: Number(cols[protIdx]) || 0,
          carbohydrates: Number(cols[carbIdx]) || 0,
          fat: Number(cols[fatIdx]) || 0,
          fiber: fiberIdx >= 0 ? Number(cols[fiberIdx]) || 0 : 0,
          category_id: category?.id || null,
          source: 'Importação CSV',
          is_active: true,
        });
      } catch {
        errors++;
      }
    }

    if (rows.length > 0) {
      const { error } = await supabase.from('foods').insert(rows);
      if (error) {
        toast({ title: 'Erro na importação', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: `✅ ${rows.length} alimentos importados${errors > 0 ? `, ${errors} erros` : ''}` });
        queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
      }
    } else {
      toast({ title: `Nenhum alimento válido. ${errors} erros.`, variant: 'destructive' });
    }

    setImporting(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const updateField = (key: string, value: any) => {
    setEditFood((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Gerenciar Alimentos</h1>
              <p className="text-xs text-muted-foreground">{foods.length} alimentos cadastrados</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
            <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => fileRef.current?.click()} disabled={importing}>
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Importar CSV
            </Button>
            <Button size="sm" className="rounded-xl gap-2 bg-primary hover:bg-primary/90" onClick={openNew}>
              <Plus className="w-4 h-4" /> Adicionar alimento
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Alimentos ({filtered.length})
              </CardTitle>
              <div className="flex gap-2 w-full sm:w-auto ml-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar alimento..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="pl-9 rounded-xl"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas categorias</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider w-10"></th>
                        <th className="text-left py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Nome</th>
                        <th className="text-left py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">Categoria</th>
                        <th className="text-right py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Kcal</th>
                        <th className="text-right py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Prot</th>
                        <th className="text-right py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Carb</th>
                        <th className="text-right py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Gord</th>
                        <th className="text-right py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((food, i) => (
                        <motion.tr
                          key={food.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-border/30 hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-2.5 text-center text-lg">{getCategoryIcon(food.category_id)}</td>
                          <td className="py-2.5">
                            <p className="font-medium text-foreground">{food.name_short}</p>
                            {food.preparation && <p className="text-xs text-muted-foreground">{food.preparation}</p>}
                          </td>
                          <td className="py-2.5 text-muted-foreground text-xs hidden md:table-cell">{getCategoryName(food.category_id)}</td>
                          <td className="py-2.5 text-right text-foreground font-medium">{food.calories}</td>
                          <td className="py-2.5 text-right text-muted-foreground hidden sm:table-cell">{food.protein}g</td>
                          <td className="py-2.5 text-right text-muted-foreground hidden sm:table-cell">{food.carbohydrates}g</td>
                          <td className="py-2.5 text-right text-muted-foreground hidden sm:table-cell">{food.fat}g</td>
                          <td className="py-2.5 text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(food)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => { setDeleteFood(food); setDeleteOpen(true); }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">Página {page} de {totalPages}</p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit/Create dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl max-w-lg max-h-[85vh] overflow-y-auto">
          {editFood && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {editFood._isNew ? 'Adicionar alimento' : `Editar: ${editFood.name_short}`}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Nome completo</Label>
                    <Input value={editFood.name} onChange={e => updateField('name', e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Nome curto</Label>
                    <Input value={editFood.name_short} onChange={e => updateField('name_short', e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Preparo</Label>
                    <Input value={editFood.preparation || ''} onChange={e => updateField('preparation', e.target.value)} className="rounded-xl" placeholder="Ex: cozido, grelhado" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Categoria</Label>
                    <Select value={editFood.category_id || 'none'} onValueChange={v => updateField('category_id', v === 'none' ? null : v)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem categoria</SelectItem>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Fonte</Label>
                    <Input value={editFood.source} onChange={e => updateField('source', e.target.value)} className="rounded-xl" />
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Valores nutricionais (por 100g)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'calories', label: 'Calorias (kcal)' },
                      { key: 'protein', label: 'Proteína (g)' },
                      { key: 'carbohydrates', label: 'Carboidrato (g)' },
                      { key: 'fat', label: 'Gordura (g)' },
                      { key: 'fiber', label: 'Fibra (g)' },
                    ].map(f => (
                      <div key={f.key} className="space-y-1">
                        <Label className="text-xs">{f.label}</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={editFood[f.key]}
                          onChange={e => updateField(f.key, e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl">Cancelar</Button>
                <Button onClick={handleSave} disabled={saving || !editFood.name.trim()} className="rounded-xl bg-primary hover:bg-primary/90">
                  {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  {editFood._isNew ? 'Criar' : 'Salvar'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir alimento?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteFood?.name_short}" será removido permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
