# ArenaGo — Roadmap de Implementação

> **Slogan:** "Sua próxima partida a um clique."

---

## 🎯 Visão do Produto
O **ArenaGo** conecta jogadores a quadras esportivas e oferece um software de gestão completo para os donos de estabelecimentos esportivos (arenas de futebol, society, beach tennis, tênis, etc.).

---

## 📅 Fases & Sprints

### 🟢 Fase 1: Fundação & Multi-tenancy (Sprints 1 e 2)
- [x] Definição de Arquitetura e Decisões de Engenharia (`docs/ARQUITETURA.md`).
- [x] Mapeamento de Telas e Identidade Visual (`docs/TELAS.md`).
- [x] Modelagem Relacional PostgreSQL (`docs/SCHEMA.sql`).
- [ ] Configuração do ambiente local (`docker-compose.yml`, PostgreSQL, Redis, FastAPI, Next.js).
- [ ] Autenticação JWT com papéis (SUPERADMIN, MANAGER, PLAYER).
- [ ] Estrutura de Organizações (`organizations`) e isolamento multi-tenant.

### 🟡 Fase 2: Gestão de Arenas & Catálogo Marketplace (Sprints 3 e 4)
- [ ] CRUD de Arenas e Quadras para Gestores.
- [ ] Configuração de tipos de piso, modalidades esportivas e comodidades.
- [ ] Horários de funcionamento e regras de preços diferenciadas por dia e turno.
- [ ] Endpoint de busca de arenas com filtros geográficos, modalidade e preço.
- [ ] Interface web do Marketplace inspirada na referência *Ngeball* (Catálogo + Mapa).

### 🟠 Fase 3: Motor de Reservas & Prevenção de Overbooking (Sprints 5 e 6)
- [ ] Consulta de disponibilidade de slots em tempo real.
- [ ] Implementação do Lock Distribuído com Redis (`lock:court:{id}:slot:{time}`).
- [ ] Criação de reservas com validação de sobreposição no PostgreSQL (`prevent_overlapping_active_bookings`).
- [ ] Fluxo de reserva mobile no Portal do Jogador (*Book a Slot*).
- [ ] Linha do tempo visual no Painel do Gestor (estilo *Quadra Fácil*).

### 🔴 Fase 4: Pagamentos & Checkout (Sprints 7 e 8)
- [ ] Integração com gateway de pagamentos (Pix dinâmico com QRCode e Copia e Cola).
- [ ] Webhook de confirmação de pagamento com liberação automática de status.
- [ ] Rotina de expiração de reservas pendentes não pagas (Hold de 10 minutos).
- [ ] Política de cancelamento e reembolso automático.

### 🟣 Fase 5: Plataforma SaaS & Super Admin (Sprints 9 e 10)
- [ ] Planos de assinatura para arenas (*Starter, Pro, Business, Enterprise*).
- [ ] Painel do Super Admin inspirado na referência *Motiff* (MRR, Total Subscriptions, Churn).
- [ ] Controle de comissões por reserva online e repasse financeiro.
- [ ] Sistema de avaliações e reputação das quadras pós-partida.
