# Altfood — Guia de Migração para Novo Supabase

## Pré-requisitos
- Conta gratuita em [supabase.com](https://supabase.com)
- Acesso ao terminal com Supabase CLI instalado (`npm install -g supabase`)
- Node.js instalado

---

## PASSO 1 — Criar novo projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **New project**
2. Escolha um nome (ex: `altfood-prod`)
3. Escolha a região **South America (São Paulo)**
4. Anote a senha do banco — você vai precisar dela
5. Aguarde o projeto ser criado (~2 minutos)

Depois de criado, vá em **Settings → API** e anote:
- **Project URL**: `https://XXXXXXXXXXX.supabase.co`
- **anon public key**: `eyJ...`

---

## PASSO 2 — Criar o schema do banco

1. No Supabase Dashboard → **SQL Editor**
2. Clique em **New query**
3. Abra o arquivo `01_schema_completo.sql` desta pasta
4. Copie TODO o conteúdo e cole no SQL Editor
5. Clique em **Run**
6. Aguarde — deve mostrar `Success` sem erros

---

## PASSO 3 — Importar os alimentos

1. No SQL Editor → **New query**
2. Abra o arquivo `02_alimentos.sql`
3. Copie TODO o conteúdo e cole
4. Clique em **Run**
5. A última linha mostra uma tabela com a contagem por categoria — confirme que todas as 8 categorias aparecem

---

## PASSO 4 — Configurar autenticação

No Supabase Dashboard → **Authentication → Settings**:

1. **Site URL**: `https://seu-dominio.lovable.app` (ou o domínio final)
2. **Redirect URLs**: adicione `https://seu-dominio.lovable.app/**`
3. Opcional: configure **SMTP** para emails de confirmação

---

## PASSO 5 — Deploy das Edge Functions

No terminal, dentro da pasta `altfood/` do projeto:

```bash
# Login no Supabase
npx supabase login

# Linkar ao novo projeto (pegue o PROJECT_ID da URL: https://XXXXXXXXXXX.supabase.co)
npx supabase link --project-ref XXXXXXXXXXX

# Deploy de todas as edge functions
npx supabase functions deploy admin-delete-professional
npx supabase functions deploy cancel-subscription
npx supabase functions deploy check-rate-limit
npx supabase functions deploy create-checkout
npx supabase functions deploy create-doctor-profile
npx supabase functions deploy meta-preview
npx supabase functions deploy mp-webhook
npx supabase functions deploy send-email
npx supabase functions deploy upgrade-nudge
npx supabase functions deploy weekly-summary
npx supabase functions deploy welcome-email
```

---

## PASSO 6 — Configurar Secrets (variáveis das Edge Functions)

No Supabase Dashboard → **Edge Functions → Manage secrets**, adicione:

| Secret | Valor |
|--------|-------|
| `MP_ACCESS_TOKEN` | Token do Mercado Pago |
| `MP_WEBHOOK_SECRET` | Secret do webhook do MP |
| `RESEND_API_KEY` | Chave da API do Resend (emails) |
| `SUPABASE_URL` | URL do novo projeto |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (Settings → API) |

---

## PASSO 7 — Atualizar o .env do projeto

Edite o arquivo `altfood/.env`:

```env
VITE_SUPABASE_PROJECT_ID="NOVO_PROJECT_ID"
VITE_SUPABASE_PUBLISHABLE_KEY="NOVA_ANON_KEY"
VITE_SUPABASE_URL="https://NOVO_PROJECT_ID.supabase.co"
```

---

## PASSO 8 — Definir admin

Após criar sua conta no novo app:

1. Supabase Dashboard → **SQL Editor**
2. Execute:

```sql
-- Substitua pelo seu user_id (Authentication → Users)
INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_USER_ID_AQUI', 'admin')
ON CONFLICT DO NOTHING;
```

---

## PASSO 9 — Testar

- [ ] Login/cadastro funcionando
- [ ] Página do paciente carregando (`/SEU_SLUG`)
- [ ] Substituições calculando
- [ ] Estatísticas registrando visitas
- [ ] Admin acessível em `/admin`

---

## Sobre os usuários existentes

Os usuários cadastrados no Lovable Cloud **não podem ser exportados** sem a `service_role` key do projeto antigo (que pertence ao Lovable).

**Opções:**
1. Pedir que recadastrem — eles perdem apenas a senha, não os dados de configuração da conta (que podem ser recriados)
2. Entrar em contato com o suporte do Lovable solicitando export dos usuários

---

## Arquivos desta pasta

```
migration/
├── 01_schema_completo.sql   ← Schema completo (tabelas + RLS + funções)
├── 02_alimentos.sql         ← 177 alimentos em 8 categorias
├── edge_functions/          ← Código de todas as Edge Functions
│   ├── admin-delete-professional/
│   ├── cancel-subscription/
│   ├── check-rate-limit/
│   ├── create-checkout/
│   ├── create-doctor-profile/
│   ├── meta-preview/
│   ├── mp-webhook/
│   ├── send-email/
│   ├── upgrade-nudge/
│   ├── weekly-summary/
│   └── welcome-email/
└── GUIA_MIGRACAO.md         ← Este arquivo
```
