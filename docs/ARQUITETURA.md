# ArenaGo — Arquitetura de Software

> **Slogan:** "Sua próxima partida a um clique."  
> **Modelo de Negócio:** Marketplace Multiarenas + Plataforma SaaS para Gestores Esportivos.

---

## 1. Visão Geral da Arquitetura

O **ArenaGo** foi concebido sob o modelo de **Monólito Modular**, combinando alta velocidade de entrega inicial com fronteiras de domínio bem demarcadas para futura extração em microsserviços se necessário.

```
                             ┌─────────────────────────────────┐
                             │       Clientes Frontend         │
                             │   Next.js 15+ (App Router)      │
                             │  - Marketplace Público          │
                             │  - Portal do Jogador (Mobile)   │
                             │  - Painel do Gestor (Dashboard) │
                             │  - Super Admin (SaaS)           │
                             └────────────────┬────────────────┘
                                              │ HTTPS / WSS
                                              ▼
                             ┌─────────────────────────────────┐
                             │       FastAPI API Gateway       │
                             │  - Autenticação JWT (RBAC)      │
                             │  - Middleware Multi-tenant      │
                             │  - Rate Limiting                │
                             └────────┬──────────────┬─────────┘
                                      │              │
                   ┌──────────────────┘              └──────────────────┐
                   ▼                                                    ▼
    ┌─────────────────────────────┐                      ┌─────────────────────────────┐
    │       Módulos Core          │                      │       Cache & Locks         │
    │  - Identidade & Organizações│                      │       Redis 7+              │
    │  - Catálogo de Arenas/Quadras│                      │  - Lock Distribuído de      │
    │  - Motor de Reservas & Slot │                      │    Concorrência de Horários │
    │  - Assinaturas & Financeiro │                      │  - Cache de Disponibilidade │
    │  - Webhooks de Pagamento    │                      │  - Sessões e Rate Limiting  │
    └──────────────┬──────────────┘                      └─────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────┐
    │       Banco de Dados        │
    │       PostgreSQL 16+        │
    │  - Isolamento Multi-tenant  │
    │  - Constraints de Conflito  │
    │  - Transações ACID          │
    └─────────────────────────────┘
```

---

## 2. Decisões Arquiteturais Chave (ADRs)

### 2.1 Multi-Tenancy (Isolamento de Dados)
* **Abordagem Adotada**: Multi-tenancy por coluna discriminatória (`organization_id` / `venue_id`) associada a **Row-Level Security (RLS)** e filtros automáticos na camada de aplicação (ORM).
* **Motivo**: Permite hospedar milhares de quadras/arenas no mesmo cluster de banco de dados sem o overhead de gerenciar um schema ou banco separado por arena, mantendo isolamento rigoroso por papéis de acesso.
* **Hierarquia**:
  * `SUPER_ADMIN`: Acesso irrestrito de auditoria, métricas globais e gestão de assinaturas SaaS.
  * `MANAGER` (Gestor da Arena): Acesso somente aos recursos da sua organização (`organization_id`).
  * `EMPLOYEE` (Operador da Arena): Operação de reservas e caixa da arena.
  * `PLAYER` (Jogador): Visualização do catálogo público, criação de reservas e acesso ao seu próprio perfil e histórico.

### 2.2 Prevenção de Overbooking (Concorrência Crítica)
O desafio mais crítico em plataformas esportivas é a tentativa simultânea de reserva do mesmo horário na mesma quadra por jogadores distintos.
* **Estratégia de Defesa em Duas Camadas**:
  1. **Camada Rápida (Redis Distributed Lock)**:
     - Antes de iniciar a transação de reserva, o backend obtém um lock com chave única:
       `lock:court:{court_id}:slot:{date}:{start_time}` com TTL de 15 segundos.
     - Se o lock não for obtido, a requisição é imediatamente rejeitada com status `409 Conflict`.
  2. **Camada de Integridade Definitiva (PostgreSQL Exclusion Constraint & Transação Serializada)**:
     - No banco de dados, a tabela `bookings` utiliza tipos de intervalo `tsrange` com restrição de exclusão `EXCLUDE USING gist (court_id WITH =, time_range WITH &&) WHERE (status IN ('PENDING', 'CONFIRMED'))`.
     - Isso garante matematicamente integridade ACID mesmo em caso de falha de cache.

### 2.3 Pagamento e Hold Provisório
* Ao selecionar um slot disponível, o sistema cria uma reserva com status `PENDING` e hold temporário de 10 minutos (geração de Pix Copia e Cola / QRCode ou checkout com cartão).
* Um worker (ou tarefa agendada Redis/Celery) expira automaticamente reservas pendentes sem pagamento confirmado após o tempo limite, liberando o horário para a praça.

---

## 3. Estrutura Modular da Solução

```text
Projet_arenas/
├── apps/
│   ├── web/                     # Frontend Next.js 15+ (App Router, Tailwind CSS, TypeScript)
│   │   ├── app/
│   │   │   ├── (marketplace)/   # Marketplace de busca, filtros e catálogo de quadras
│   │   │   ├── (player)/        # Portal do jogador, minhas reservas, avaliações
│   │   │   ├── (manager)/       # Painel do gestor da arena (timeline, quadras, finanças)
│   │   │   └── (admin)/         # Super Admin SaaS (arenas cadastradas, assinaturas MRR)
│   │   ├── components/          # Design system compartilhado
│   │   └── lib/                 # Utilitários, cliente de API e tipos
│   └── api/                     # Backend FastAPI
│       ├── app/
│       │   ├── api/v1/          # Rotas REST agrupadas por domínio
│       │   ├── core/            # Configurações, Segurança, Conexões DB e Redis
│       │   ├── models/          # Modelos de dados SQLAlchemy
│       │   ├── schemas/         # Schemas de validação Pydantic
│       │   └── services/        # Regras de negócio, Lock e Pagamento
│       └── main.py
├── docs/                        # Documentação técnica e telas
│   ├── references/              # Referências visuais
│   ├── ARQUITETURA.md
│   ├── TELAS.md
│   ├── SCHEMA.sql
│   └── ROADMAP.md
├── infra/                       # Configurações Docker e scripts de inicialização
└── docker-compose.yml           # Ambiente unificado de desenvolvimento
```

---

## 4. Segurança e Autenticação
* Autenticação via **JWT (JSON Web Tokens)** assinados com HMAC-SHA256 (`HS256`).
* Hashing de senhas utilizando **Argon2id** ou **Bcrypt**.
* RBAC (Role-Based Access Control) verificado via dependências FastAPI (`Depends(require_role(...))`).
* Proteção contra CSRF e CORS configurado para os domínios permitidos do frontend.
