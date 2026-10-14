# ArenaGo ⚽ 🎾 🏀 🏐

> **"Sua próxima partida a um clique."**

Plataforma completa de Marketplace de Quadras Esportivas e Software de Gestão SaaS para Arenas e Centros Esportivos (Futebol Society, Futsal, Beach Tennis, Padel, Basquete, Vôlei, Tênis e mais).

---

## 📸 As 4 Interfaces de Referência Implementadas

O projeto foi construído respeitando com máxima fidelidade as 4 referências visuais aprovadas:

1. **Marketplace Público (`/`)**: 
   * Inspirado na referência *Ngeball* ([`docs/references/marketplace.jpg`](docs/references/marketplace.jpg)).
   * Filtros por esporte em pílulas deslizáveis, busca por cidade e data, controle de faixa de preço.
   * Cards com fotos, badges de piso e cobertura, avaliação e preços.
   * **Mapa Interativo** com pins de localização e valores por hora.

2. **Portal do Jogador (`/player`)**: 
   * Inspirado na referência *Book a Slot* ([`docs/references/portal_jogador.jpg`](docs/references/portal_jogador.jpg)).
   * Carrossel de seleção de datas (Seg, Ter, Qua, Qui, Sex, Sáb, Dom).
   * Grade de slots horários das 07:00 às 23:00 com status visual (Livre / Reservado).
   * Drawer de confirmação e checkout com garantia anti-overbooking atômica.
   * Aba "Minhas Reservas" com cancelamento com 1 clique e acompanhamento.

3. **Painel do Gestor da Arena (`/manager`)**: 
   * Inspirado na referência *Quadra Fácil* ([`docs/references/painel_gestor.jpg`](docs/references/painel_gestor.jpg)).
   * Linha do tempo visual codificada por cores:
     * 🟢 **Verde**: Horários livres disponíveis para aluguel.
     * 🟠 **Laranja**: Horários reservados com identificação do cliente e modalidade (avulsa ou mensalista).
   * KPIs rápidos de reservas diárias, faturamento e taxa de ocupação.
   * Modal de reserva rápida de balcão (reserva presencial com bloqueio imediato na grade).

4. **Super Admin SaaS (`/admin`)**: 
   * Inspirado na referência *Motiff* ([`docs/references/super_admin.jpg`](docs/references/super_admin.jpg)).
   * Cards de métricas financeiras consolidadas: **MRR (Monthly Recurring Revenue)**, Assinaturas Ativas, Total de Arenas e Taxa de Churn.
   * Tabela com busca, filtros por status e plano (Enterprise, Business, Pro, Starter) e ciclo de cobrança.

---

## 🔑 Credenciais de Demonstração

Para facilitar o teste de todas as personas, a barra de navegação superior possui um **seletor rápido de perfil (Demo Switcher)**, ou você pode utilizar as seguintes contas pré-configuradas:

| Perfil | E-mail | Senha | Acesso Recomendado |
| :--- | :--- | :--- | :--- |
| **Super Admin SaaS** | `admin@arenago.com.br` | `admin123` | [`http://localhost:3000/admin`](http://localhost:3000/admin) |
| **Gestor da Arena** | `gestor@beacharena.com.br` | `arena123` | [`http://localhost:3000/manager`](http://localhost:3000/manager) |
| **Jogador / Atleta** | `jogador@arenago.com.br` | `player123` | [`http://localhost:3000/player`](http://localhost:3000/player) |

---

## 🏗️ Arquitetura e Stack Tecnológica

* **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
* **Backend**: FastAPI (Python 3.12), REST API assíncrona, SQLAlchemy 2.0 (Async), Pydantic v2.
* **Banco de Dados**: PostgreSQL 16+ com isolamento multi-tenant (`organization_id`) e restrições de exclusão de horários (`tstzrange` GiST). Fallback automático para SQLite (`aiosqlite`) em desenvolvimento ágil.
* **Cache & Locks**: Redis 7 com distributed locks (`redis-py`) com fallback in-memory assíncrono.
* **Orquestração**: Docker Compose multi-serviços.

Consulte a documentação completa em:
* [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md)
* [`docs/TELAS.md`](docs/TELAS.md)
* [`docs/SCHEMA.sql`](docs/SCHEMA.sql)
* [`docs/ROADMAP.md`](docs/ROADMAP.md)

---

## 🚀 Como Executar

### Opção A: Execução via Docker Compose (Recomendada para Produção/Staging)

```bash
docker compose up -d
```
* **Frontend Web**: `http://localhost:3000`
* **API FastAPI**: `http://localhost:8000`
* **Swagger Interativo**: `http://localhost:8000/docs`

---

### Opção B: Execução Local Rápida (Desenvolvimento)

#### 1. Backend (FastAPI):
```bash
# Na pasta raiz do projeto:
cd apps/api
.venv\Scripts\activate    # Windows
# source .venv/bin/activate # Linux/Mac
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend (Next.js):
```bash
# Em um novo terminal:
cd apps/web
npm run dev
```
Acesse `http://localhost:3000` no seu navegador!

---

## 🛡️ Garantia Anti-Overbooking (Double-Layer Lock)

Para proteger a plataforma contra concorrência e condições de corrida (quando múltiplos atletas tentam reservar a mesma quadra e horário ao mesmo segundo):

```text
[Requisição de Reserva]
         │
         ▼
[1. Redis Distributed Lock: lock:court:{id}:{date}]
         │
         ├── Se ocupado ➔ Retorna 409 Conflict imediatamente (sem onerar o banco)
         │
         └── Se adquirido ➔
                   │
                   ▼
[2. PostgreSQL GiST Exclusion Constraint / Transação Atômica]
                   │
                   ├── Validação no banco com tstzrange
                   └── Commit da reserva + Liberação do Lock Redis
```

---

## 📄 Licença e Direitos

Projeto desenvolvido com foco na excelência de experiência esportiva e tecnologia de alta performance.  
© 2026 ArenaGo — *Sua próxima partida a um clique.*
