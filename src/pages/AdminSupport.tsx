import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/helpers';
import { ArrowLeft, Loader2, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Ticket {
  id: string;
  doctor_id: string;
  message: string;
  status: string;
  admin_reply: string | null;
  created_at: string;
  resolved_at: string | null;
  doctor_name: string;
  doctor_email: string;
}

export default function AdminSupport() {
  const { isAdmin, loading: authLoading } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_support_tickets');
      if (error) throw error;
      return (data || []) as Ticket[];
    },
    enabled: isAdmin,
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ ticketId, newStatus, replyText }: { ticketId: string; newStatus: string; replyText?: string }) => {
      const { error } = await supabase.rpc('admin_update_ticket_status', {
        ticket_id: ticketId,
        new_status: newStatus,
        reply: replyText || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      setSelectedTicket(null);
      setReply('');
      toast({ title: '✅ Ticket atualizado' });
    },
  });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const filtered = statusFilter === 'all' ? tickets : tickets.filter(t => t.status === statusFilter);
  const openCount = tickets.filter(t => t.status === 'open').length;
  const closedCount = tickets.filter(t => t.status === 'closed').length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground">Suporte — Tickets</h1>
            <p className="text-xs text-muted-foreground">{openCount} abertos · {closedCount} resolvidos</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos ({tickets.length})</SelectItem>
              <SelectItem value="open">Abertos ({openCount})</SelectItem>
              <SelectItem value="closed">Resolvidos ({closedCount})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum ticket encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(ticket => (
              <Card key={ticket.id} className="rounded-2xl shadow-sm border-border/50 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => { setSelectedTicket(ticket); setReply(ticket.admin_reply || ''); }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-foreground">{ticket.doctor_name}</p>
                        <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'} className="text-[10px]">
                          {ticket.status === 'open' ? 'Aberto' : 'Resolvido'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{ticket.doctor_email}</p>
                      <p className="text-sm text-foreground line-clamp-2">{ticket.message}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-muted-foreground">{formatDate(ticket.created_at)}</p>
                      {ticket.status === 'open' ? (
                        <Clock className="w-4 h-4 text-warning mt-1 ml-auto" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 ml-auto" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Ticket detail dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={v => { if (!v) setSelectedTicket(null); }}>
        <DialogContent className="max-w-md rounded-2xl">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">Ticket de {selectedTicket.doctor_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Mensagem</p>
                  <p className="text-sm text-foreground">{selectedTicket.message}</p>
                </div>
                <p className="text-xs text-muted-foreground">E-mail: {selectedTicket.doctor_email}</p>
                <p className="text-xs text-muted-foreground">Data: {formatDate(selectedTicket.created_at)}</p>
                <Textarea
                  placeholder="Resposta do admin (opcional)..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  className="rounded-xl min-h-[60px] text-sm"
                />
              </div>
              <DialogFooter className="gap-2">
                {selectedTicket.status === 'open' && (
                  <Button
                    onClick={() => resolveMutation.mutate({ ticketId: selectedTicket.id, newStatus: 'closed', replyText: reply })}
                    disabled={resolveMutation.isPending}
                    className="rounded-xl gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {resolveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Marcar como resolvido
                  </Button>
                )}
                {selectedTicket.status === 'closed' && (
                  <Button
                    variant="outline"
                    onClick={() => resolveMutation.mutate({ ticketId: selectedTicket.id, newStatus: 'open' })}
                    disabled={resolveMutation.isPending}
                    className="rounded-xl"
                  >
                    Reabrir
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
