-- =============================================================================
-- ArenaGo — Schema do Banco de Dados PostgreSQL 16+
-- Slogan: "Sua próxima partida a um clique."
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM (
    'SUPERADMIN',
    'MANAGER',
    'EMPLOYEE',
    'PLAYER'
);

CREATE TYPE sport_type AS ENUM (
    'FOOTBALL',
    'FUTSAL',
    'SOCIETY',
    'BEACH_TENNIS',
    'TENNIS',
    'BASKETBALL',
    'VOLLEYBALL',
    'PADEL',
    'HANDBALL'
);

CREATE TYPE court_surface AS ENUM (
    'SYNTHETIC_GRASS',
    'NATURAL_GRASS',
    'PARQUET_WOOD',
    'VINYL',
    'INTERLOCK_PLASTIC',
    'SAND',
    'CONCRETE',
    'CLAY'
);

CREATE TYPE booking_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);

CREATE TYPE booking_type AS ENUM (
    'ONLINE_SINGLE',
    'BALCAO_SINGLE',
    'MONTHLY_RECURRING'
);

CREATE TYPE payment_method AS ENUM (
    'PIX',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'CASH_AT_VENUE'
);

CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED'
);

CREATE TYPE plan_tier AS ENUM (
    'STARTER',
    'PRO',
    'BUSINESS',
    'ENTERPRISE'
);

CREATE TYPE subscription_status AS ENUM (
    'TRIAL',
    'ACTIVE',
    'PAST_DUE',
    'CANCELLED'
);

-- -----------------------------------------------------------------------------
-- 1. IDENTIDADE & MULTI-TENANCY
-- -----------------------------------------------------------------------------
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    document_number VARCHAR(30) UNIQUE, -- CNPJ / CPF
    phone VARCHAR(30),
    email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'PLAYER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'MANAGER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 2. ESTABELECIMENTOS & QUADRAS
-- -----------------------------------------------------------------------------
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    phone VARCHAR(30),
    address_street VARCHAR(255) NOT NULL,
    address_number VARCHAR(50) NOT NULL,
    address_complement VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    amenities JSONB DEFAULT '[]'::jsonb, -- ['parking', 'locker_room', 'bar', 'wifi', 'bbq']
    cover_image_url TEXT,
    rating_average DECIMAL(3, 2) DEFAULT 5.00,
    rating_count INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sport_type sport_type NOT NULL,
    surface court_surface NOT NULL,
    is_indoor BOOLEAN NOT NULL DEFAULT FALSE,
    default_hourly_rate DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE court_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. DISPONIBILIDADE & REGRAS DE PREÇO
-- -----------------------------------------------------------------------------
CREATE TABLE operating_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL, -- 0 = Domingo, 6 = Sábado
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_venue_day UNIQUE (venue_id, day_of_week)
);

CREATE TABLE price_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE court_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. RESERVAS & PREVENÇÃO DE CONCORRÊNCIA
-- -----------------------------------------------------------------------------
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    booking_type booking_type NOT NULL DEFAULT 'ONLINE_SINGLE',
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status booking_status NOT NULL DEFAULT 'PENDING',
    payment_method payment_method,
    payment_status payment_status NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    expires_at TIMESTAMP WITH TIME ZONE, -- Hold temporário para conclusão de pagamento
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Restrição de integridade: Garante que horários ativos na mesma quadra nunca colidam
    CONSTRAINT prevent_overlapping_active_bookings 
    EXCLUDE USING gist (
        court_id WITH =,
        tstzrange(start_time, end_time, '[)') WITH &&
    ) WHERE (status IN ('PENDING', 'CONFIRMED'))
);

-- -----------------------------------------------------------------------------
-- 5. PAGAMENTOS & REPASSES
-- -----------------------------------------------------------------------------
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) DEFAULT 0.00,
    net_venue_amount DECIMAL(10, 2) NOT NULL,
    gateway_transaction_id VARCHAR(255),
    gateway_status VARCHAR(50),
    payment_method payment_method NOT NULL,
    pix_qr_code TEXT,
    pix_code TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 6. MODELO SAAS (PLANOS E ASSINATURAS DAS ARENAS)
-- -----------------------------------------------------------------------------
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier plan_tier NOT NULL,
    name VARCHAR(100) NOT NULL,
    monthly_price DECIMAL(10, 2) NOT NULL,
    max_courts INT NOT NULL DEFAULT 2,
    commission_percentage DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status subscription_status NOT NULL DEFAULT 'ACTIVE',
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    mrr_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 7. AVALIAÇÕES E REPUTAÇÃO
-- -----------------------------------------------------------------------------
CREATE TABLE court_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- ÍNDICES PARA BUSCA E PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX idx_venues_city_state ON venues(city, state);
CREATE INDEX idx_venues_org ON venues(organization_id);
CREATE INDEX idx_courts_venue ON courts(venue_id);
CREATE INDEX idx_courts_sport ON courts(sport_type);
CREATE INDEX idx_bookings_court_status ON bookings(court_id, status);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_timerange ON bookings USING gist (tstzrange(start_time, end_time, '[)'));
CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
