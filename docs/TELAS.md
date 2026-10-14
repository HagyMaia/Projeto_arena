# ArenaGo — Especificação de Telas e Design UI/UX

> **Slogan:** "Sua próxima partida a um clique."  
> Este documento mapeia a interface de usuário (UI/UX) do ArenaGo, estruturada a partir das 4 referências visuais aprovadas.

---

## 1. Módulo Marketplace Público (Web / Desktop)
*Referência visual: `docs/references/marketplace.jpg` (Inspirado no Ngeball)*

### 1.1 Objetivo
Permitir que qualquer jogador encontre quadras esportivas por localização, modalidade, preço e tipo de piso, com visualização em catálogo e mapa interativo.

### 1.2 Componentes e Layout
* **Header de Navegação**:
  * Logotipo **ArenaGo** com slogan "Sua próxima partida a um clique".
  * Barra de busca rápida por nome de arena, bairro ou modalidade.
  * Carrossel de modalidades com ícones (Futebol, Futsal, Beach Tennis, Basquete, Vôlei, Tênis, Ginástica, Natação).
  * Botões de Ação: "Minhas Reservas", "Sou Dono de Arena" e "Entrar / Cadastrar".
* **Barra Lateral de Filtros (Sidebar)**:
  * **Localização**: Seletor de cidade/bairro e raio de distância em km.
  * **Data & Horário**: Data pretendida e faixa horária (ex: 18:00 - 22:00).
  * **Preço por Hora**: Slider com gráfico de frequência/histograma de preços.
  * **Tipo de Quadra**: Checkboxes (Coberta / Externa).
  * **Tipo de Piso**: Miniaturas selecionáveis (Grama Sintética, Parquet/Madeira, Vinílico, Intertravado, Areia de Praia).
  * **Comodidades**: Vestiário, Estacionamento, Churrasqueira, Bar/Lanchonete, Iluminação LED.
  * **Avaliação**: Filtro por estrelas (1★ a 5★).
* **Área Central de Resultados**:
  * Contador de quadras encontradas (ex: "450 Quadras encontradas na sua região").
  * **Seção "Quadras em Destaque"**: Cards com carrossel de fotos, badge de nota (4.9 ★), distância, tags de piso, valor por hora e botão de reserva rápida.
  * **Seção "Todas as Quadras"**: Lista com visualização compacta, foto miniatura, especificações e botão CTA "Reservar Agora".
* **Painel Lateral do Mapa Interativo (Direita)**:
  * Mapa dinâmico com marcadores personalizados para cada arena.
  * Card flutuante com foto, nome e preço ao clicar no pino.
  * Traçado de rota e distância estimada a partir da localização do jogador.

---

## 2. Portal do Jogador (Mobile App / Responsivo)
*Referência visual: `docs/references/portal_jogador.jpg`*

### 2.1 Objetivo
Garantir uma experiência rápida e fluida no smartphone para o jogador pesquisar, reservar horários e gerenciar suas partidas.

### 2.2 Telas Principais
1. **Home Mobile**:
   * Saudação personalizada e seletor rápido de modalidade.
   * Banner de promoções e quadras próximas com geolocalização.
2. **Página de Detalhes da Arena / Quadra**:
   * Carrossel de fotos em alta definição.
   * Informações detalhadas: regras de uso, fotos dos vestiários, mapa e comodidades.
   * Lista de quadras do complexo (Quadra 1 - Futsal, Quadra 2 - Beach Tennis).
3. **Agendamento de Horário (*Book a Slot*)**:
   * Calendário horizontal interativo (dias da semana e mês).
   * Alternador Manhã (AM) / Tarde e Noite (PM).
   * Grade de horários com indicação de status:
     * Disponível (com exibição do valor daquele horário).
     * Ocupado / Indisponível (desabilitado).
     * Selecionado pelo usuário.
   * Barra de checkout fixo no rodapé com valor total e botão "Avançar para Pagamento".
4. **Minhas Reservas (*My Bookings*)**:
   * Abas: "Próximas Partidas" e "Histórico".
   * Cards com código da reserva, data, horário, quadra e endereço.
   * Badges de status: `Confirmado` (verde), `Aguardando Pagamento` (amarelo), `Concluído` (azul), `Cancelado` (vermelho).
   * Botão de "Cancelar Reserva" (respeitando política da arena).
   * Botão de "Avaliar Arena" pós-jogo.
5. **Modal de Avaliação e Reviews**:
   * Classificação por estrelas (1 a 5).
   * Tags de feedback (Estrutura, Limpeza, Iluminação).
   * Campo de comentário aberto.

---

## 3. Painel do Gestor da Arena (Dashboard & Timeline)
*Referência visual: `docs/references/painel_gestor.jpg` (Inspirado no Quadra Fácil)*

### 3.1 Objetivo
Permitir que donos de arenas e operadores acompanhem em tempo real a ocupação de suas quadras, cadastrem horários de mensalistas e façam reservas de balcão.

### 3.2 Componentes e Layout
* **Topo do Painel**:
  * Saudação: "Olá, [Nome da Arena] =)".
  * Seletor de data e alternadores rápidos: "Timeline Hoje", "Visão Semanal", "Relatórios".
  * Métricas do dia em destaque: Faturamento Hoje, Taxa de Ocupação, Próximas Partidas.
* **Linha do Tempo Visual Diária (Timeline)**:
  * Visualização horizontal/vertical por quadra.
  * **Blocos Verdes**: Horários vagos e disponíveis para venda no marketplace.
  * **Blocos Laranja/Pêssego**: Horários reservados, exibindo nome do cliente, telefone, tipo de reserva (Avulsa online, Balcão, Mensalista semanal).
  * Ação rápida ao clicar em bloco vago: Bloquear horário ou Realizar reserva manual de balcão.
* **Painel Lateral de Reservas do Dia**:
  * Lista cronológica de partidas com filtros por quadra e status de pagamento (Pago / Pagar no local).
* **Gestão de Quadras e Preços**:
  * Cadastro de quadras com fotos, dimensões e tipo de piso.
  * Tabela de precificação dinâmica por dia da semana e faixa de horário (ex: Segunda a Quinta 18h-22h = R$ 140/h; Sábado = R$ 180/h).

---

## 4. Super Admin (Plataforma SaaS)
*Referência visual: `docs/references/super_admin.jpg` (Inspirado no Motiff Dashboard)*

### 4.1 Objetivo
Permitir à equipe do **ArenaGo** administrar as arenas parceiras, aprovar novos cadastros, acompanhar métricas de faturamento SaaS e comissões da plataforma.

### 4.2 Indicadores Chave (KPIs)
* **Total Subscriptions**: Total de arenas cadastradas na plataforma.
* **Active Subscriptions**: Arenas ativas e adimplentes no sistema.
* **Monthly Recurring Revenue (MRR)**: Receita mensal recorrente gerada pelas mensalidades dos planos de gestão.
* **Churn Rate**: Taxa de cancelamento de planos pelas arenas.

### 4.3 Tabela de Gestão de Assinaturas & Arenas
* **Filtros**: Status (Ativo, Em Período de Teste/Trial, Inadimplente, Cancelado), Tipo de Plano (Starter, Pro, Business, Enterprise), Ciclo (Mensal, Trimestral, Anual).
* **Colunas da Tabela**:
  * Cliente / Arena (Logotipo, Razão Social, Bairro/Cidade).
  * Plano Contratado.
  * Status da Conta (Badge colorido).
  * Ciclo de Cobrança.
  * Data da Próxima Renovação.
  * MRR / Valor da Assinatura.
  * Ações: Ver detalhes, Bloquear acesso, Alterar plano, Exportar relatório financeiro.
