import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Copy, Users, ExternalLink, ChevronDown, ChevronUp, EyeOff, Eye, Search, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { generateSlug } from '@/lib/helpers';
import type { Database } from '@/integrations/supabase/types';

type Food = Database['public']['Tables']['foods']['Row'];

interface Props {
  doctorId: string;
  doctorSlug: string;
}

export default function PatientProfileManager({ doctorId, doctorSlug }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slugSuffix, setSlugSuffix] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [foodSearch, setFoodSearch] = useState('');

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['patient-profiles', doctorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: foods = [] } = useQuery({
    queryKey: ['all-foods-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('foods').select('*').eq('is_active', true).order('name_short');
      return (data || []) as Food[];
    },
  });

  const handleCreate = async () => {
    if (!name.trim() || !slugSuffix.trim()) {
      toast({ title: 'Preencha nome e sufixo', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const { error } = await supabase.from('patient_profiles').insert({
        doctor_id: doctorId,
        name: name.trim(),
        slug_suffix: generateSlug(slugSuffix),
        description: description.trim() || null,
        hidden_food_ids: [],
      });
      if (error) throw error;
      toast({ title: 'Grupo criado!' });
      setShowCreate(false);
      setName('');
      setSlugSuffix('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['patient-profiles'] });
    } catch (err: any) {
      toast({ title: 'Erro ao criar grupo', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('patient_profiles').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Grupo excluído' });
      queryClient.invalidateQueries({ queryKey: ['patient-profiles'] });
    }
  };

  const toggleFoodHidden = async (profileId: string, foodId: string, currentHidden: string[]) => {
    const newHidden = currentHidden.includes(foodId)
      ? currentHidden.filter(id => id !== foodId)
      : [...currentHidden, foodId];
    
    const { error } = await supabase
      .from('patient_profiles')
      .update({ hidden_food_ids: newHidden })
      .eq('id', profileId);
    
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['patient-profiles'] });
    }
  };

  const copyUrl = (suffix: string) => {
    const url = `${window.location.origin}/${doctorSlug}/${suffix}`;
    navigator.clipboard.writeText(url);
    toast({ title: '✅ Link copiado!' });
  };

  const editingProfile = profiles.find(p => p.id === editingProfileId);
  const filteredFoods = foodSearch
    ? foods.filter(f => f.name.toLowerCase().includes(foodSearch.toLowerCase()) || f.name_short.toLowerCase().includes(foodSearch.toLowerCase()))
    : foods.slice(0, 50);

  return (
    <>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Grupos de Pacientes
            </CardTitle>
            <Button size="sm" variant="outline" className="rounded-lg text-xs gap-1" onClick={() => setShowCreate(!showCreate)}>
              <Plus className="w-3 h-3" /> Novo grupo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showCreate && (
            <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/30">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome do grupo</Label>
                <Input
                  value={name}
                  onChange={e => { setName(e.target.value); setSlugSuffix(generateSlug(e.target.value)); }}
                  placeholder="Ex: Diabéticos, Gestantes, Atletas"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Sufixo da URL</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">/{doctorSlug}/</span>
                  <Input
                    value={slugSuffix}
                    onChange={e => setSlugSuffix(generateSlug(e.target.value))}
                    className="rounded-lg flex-1"
                    placeholder="diabeticos"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Descrição (opcional)</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="rounded-lg"
                  rows={2}
                  placeholder="Descrição interna do grupo"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-lg text-xs bg-primary hover:bg-primary/90" onClick={handleCreate} disabled={creating}>
                  {creating ? <Loader2 className="animate-spin h-3 w-3 mr-1" /> : null}
                  Criar grupo
                </Button>
                <Button size="sm" variant="ghost" className="rounded-lg text-xs" onClick={() => setShowCreate(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Nenhum grupo criado ainda.</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Crie grupos para personalizar quais alimentos cada tipo de paciente vê.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {profiles.map(profile => (
                <div key={profile.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{profile.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      /{doctorSlug}/{profile.slug_suffix} · {(profile.hidden_food_ids as string[])?.length || 0} alimentos ocultos
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyUrl(profile.slug_suffix)}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <a href={`${window.location.origin}/${doctorSlug}/${profile.slug_suffix}`} target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                    <Button size="sm" variant="outline" className="rounded-lg text-xs h-8" onClick={() => setEditingProfileId(profile.id)}>
                      <EyeOff className="w-3 h-3 mr-1" /> Alimentos
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(profile.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Food visibility dialog for a profile */}
      <Dialog open={!!editingProfileId} onOpenChange={() => setEditingProfileId(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Alimentos ocultos — {editingProfile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={foodSearch}
              onChange={e => setFoodSearch(e.target.value)}
              placeholder="Buscar alimento..."
              className="pl-9 rounded-lg"
            />
          </div>
          <div className="overflow-y-auto flex-1 space-y-1 max-h-[50vh]">
            {filteredFoods.map(food => {
              const isHidden = (editingProfile?.hidden_food_ids as string[] || []).includes(food.id);
              return (
                <button
                  key={food.id}
                  onClick={() => editingProfile && toggleFoodHidden(editingProfile.id, food.id, editingProfile.hidden_food_ids as string[] || [])}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isHidden ? 'bg-destructive/5 text-muted-foreground' : 'hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <span className={isHidden ? 'line-through' : ''}>{food.name_short}</span>
                  {isHidden ? (
                    <EyeOff className="w-4 h-4 text-destructive/50" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground/30" />
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
