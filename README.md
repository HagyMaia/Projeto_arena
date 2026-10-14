# ArenaGo ⚽ 🎾 🏀

> **"Sua próxima partida a um clique."**

Plataforma completa de Marketplace de Quadras Esportivas e Software de Gestão SaaS para Arenas e Centros Esportivos (Futebol, Futsal, Beach Tennis, Basquete, Vôlei, Tênis e mais).

---

## 📸 Referências Visuais do Design

As telas e fluxos foram projetados com base em referências de UX/UI aprovadas:
* [Marketplace Público](docs/references/marketplace.jpg): Catálogo de quadras, filtros avançados e mapa interativo (estilo *Ngeball*).
* [Portal do Jogador](docs/references/portal_jogador.jpg): Interface mobile com fluxo de reserva (*Book a Slot*), histórico de partidas e avaliações.
* [Painel do Gestor](docs/references/painel_gestor.jpg): Linha do tempo diária visual de ocupação de quadras (estilo *Quadra Fácil*).
* [Super Admin SaaS](docs/references/super_admin.jpg): Gestão de assinaturas, MRR, arenas parceiras e métricas de faturamento (estilo *Motiff*).

Consulte [TELAS.md](docs/TELAS.md) para a especificação detalhada de cada módulo.

---

## 🏗️ Arquitetura e Stack Tecnológica

* **Frontend**: Next.js 15+ (App Router), TypeScript, Tailwind CSS, Lucide React Icons.
* **Backend**: FastAPI (Python 3.12), REST API modular, SQLAlchemy 2.0 (Async), Pydantic v2.
* **Banco de Dados**: PostgreSQL 16+ com isolamento multi-tenant e restrições de exclusão de horários (`tstzrange`).
* **Cache & Locks**: Redis 7+ com distributed lock para garantia anti-overbooking.
* **Orquestração**: Docker Compose.

Consulte [ARQUITETURA.md](docs/ARQUITETURA.md) e [SCHEMA.sql](docs/SCHEMA.sql).

---

## 📂 Estrutura de Diretórios

```text
Projet_arenas/
├── apps/
│   ├── web/                     # Frontend Next.js
│   │   ├── app/                 # Páginas (Marketplace, Portal do Jogador, Gestor, Super Admin)
│   │   ├── components/          # Componentes visuais
│   │   └── lib/                 # Utilitários e API Client
│   └── api/                     # Backend FastAPI
│       ├── app/
│       │   ├── api/v1/          # Endpoints REST (auth, venues, bookings, etc.)
│       │   ├── core/            # Config, banco de dados, Redis, segurança JWT
│       │   ├── models/          # Modelos de dados relacionais
│       │   ├── schemas/         # Validações Pydantic
│       │   └── services/        # Regras de negócio e Lock de concorrência
│       └── main.py              # Ponto de entrada da API
├── docs/                        # Documentação técnica e design
│   ├── references/              # Mockups e imagens de referência
│   ├── ARQUITETURA.md
│   ├── TELAS.md
│   ├── SCHEMA.sql
│   └── ROADMAP.md
├── docker-compose.yml           # Ambiente local unificado
└── README.md
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* [Docker & Docker Compose](https://www.docker.com/) instalados
* (Opcional para desenvolvimento sem Docker) Node.js 20+ e Python 3.12+

### Subindo todo o ambiente com Docker:
```bash
docker compose up -d
```
* **Frontend**: `http://localhost:3000`
* **API FastAPI**: `http://localhost:8000`
* **Documentação Swagger**: `http://localhost:8000/docs`
