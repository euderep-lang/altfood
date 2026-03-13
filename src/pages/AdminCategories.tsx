import { useState, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Loader2, Shield, ArrowLeft, Plus, Pencil, Trash2, GripVertical
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type FoodCategory = Database['public']['Tables']['food_categories']['Row'];

const emptyCategory = { name: '', icon: '🍽️', color: '#0F766E' };

const emptyCategory = { name: '', icon: '🍽️', color: '#0F766E' };

export default function AdminCategories() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);
  const [deleteCat, setDeleteCat] = useState<FoodCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('food_categories').select('*').order('sort_order');
      return (data || []) as FoodCategory[];
    },
    enabled: isAdmin,
  });

  const { data: foodCounts = {} } = useQuery({
    queryKey: ['admin-food-counts'],
    queryFn: async () => {
      const { data } = await supabase.from('foods').select('category_id');
      const counts: Record<string, number> = {};
      (data || []).forEach((f: any) => {
        if (f.category_id) counts[f.category_id] = (counts[f.category_id] || 0) + 1;
      });
      return counts;
    },
    enabled: isAdmin,
  });

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const openNew = () => {
    setEditCat({ ...emptyCategory, _isNew: true });
    setEditOpen(true);
  };

  const openEdit = (cat: FoodCategory) => {
    setEditCat({ ...cat, _isNew: false });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editCat) return;
    setSaving(true);
    const { _isNew, id, ...data } = editCat;
    if (!data.name.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' });
      setSaving(false);
      return;
    }

    if (_isNew) {
      data.sort_order = categories.length;
      const { error } = await supabase.from('food_categories').insert(data);
      if (error) {
        toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: '✅ Categoria criada' });
      }
    } else {
      const { error } = await supabase.from('food_categories').update(data).eq('id', id);
      if (error) {
        toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: '✅ Categoria atualizada' });
      }
    }
    setSaving(false);
    setEditOpen(false);
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
  };

  const handleDelete = async () => {
    if (!deleteCat) return;
    const count = foodCounts[deleteCat.id] || 0;
    if (count > 0) {
      toast({ title: `Categoria tem ${count} alimentos`, description: 'Mova os alimentos antes de excluir.', variant: 'destructive' });
      setDeleteOpen(false);
      return;
    }
    const { error } = await supabase.from('food_categories').delete().eq('id', deleteCat.id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Categoria excluída' });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    }
    setDeleteOpen(false);
    setDeleteCat(null);
  };

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
  };

  const handleDrop = async (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      return;
    }

    const reordered = [...categories];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    // Update sort_order for all
    const updates = reordered.map((c, i) => ({ id: c.id, sort_order: i }));
    for (const u of updates) {
      await supabase.from('food_categories').update({ sort_order: u.sort_order }).eq('id', u.id);
    }
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    toast({ title: '✅ Ordem atualizada' });
    setDraggedIdx(null);
  };

  const updateField = (key: string, value: any) => {
    setEditCat((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
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
              <h1 className="text-lg font-bold text-foreground">Gerenciar Categorias</h1>
              <p className="text-xs text-muted-foreground">{categories.length} categorias • Arraste para reordenar</p>
            </div>
          </div>
          <Button size="sm" className="rounded-xl gap-2 bg-primary hover:bg-primary/90" onClick={openNew}>
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
            ) : (
              <div className="space-y-2">
                {categories.map((cat, idx) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={() => handleDrop(idx)}
                    className={`flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-all cursor-grab active:cursor-grabbing ${
                      draggedIdx === idx ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: `${cat.color}18` }}
                    >
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{foodCounts[cat.id] || 0} alimentos</p>
                    </div>
                    <div className="w-6 h-6 rounded-full shrink-0 border border-border" style={{ backgroundColor: cat.color }} />
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(cat)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => { setDeleteCat(cat); setDeleteOpen(true); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma categoria cadastrada.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit/Create dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          {editCat && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {editCat._isNew ? 'Nova categoria' : `Editar: ${editCat.name}`}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome</Label>
                  <Input value={editCat.name} onChange={e => updateField('name', e.target.value)} className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Emoji</Label>
                    <Input value={editCat.icon} onChange={e => updateField('icon', e.target.value)} className="rounded-xl text-center text-xl" maxLength={4} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cor</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={editCat.color} onChange={e => updateField('color', e.target.value)} className="w-10 h-10 rounded-xl border-0 cursor-pointer" />
                      <Input value={editCat.color} onChange={e => updateField('color', e.target.value)} className="rounded-xl flex-1" />
                    </div>
                  </div>
                </div>
                {/* Preview */}
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground mb-2">Preview</p>
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: `${editCat.color}12` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${editCat.color}20` }}>
                      {editCat.icon}
                    </div>
                    <p className="font-semibold text-sm text-foreground">{editCat.name || 'Nome da categoria'}</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl">Cancelar</Button>
                <Button onClick={handleSave} disabled={saving || !editCat.name.trim()} className="rounded-xl bg-primary hover:bg-primary/90">
                  {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  {editCat._isNew ? 'Criar' : 'Salvar'}
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
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteCat?.name}" será removida permanentemente. {(foodCounts[deleteCat?.id || ''] || 0) > 0 && 'Mova os alimentos antes de excluir.'}
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
