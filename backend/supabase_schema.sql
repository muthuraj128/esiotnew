-- ===================================================================
-- 🌴 TREE HEALTH MONITORING SYSTEM (THM) - COMPLETE SUPABASE DDL
-- ===================================================================

-- 1. DROP EXISTING TABLES (Reverse dependency order with CASCADE)
DROP TABLE IF EXISTS public.check_history CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.devices CASCADE;
DROP TABLE IF EXISTS public.trees CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;

-- 2. CREATE CUSTOMERS TABLE
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code VARCHAR(20) UNIQUE NOT NULL DEFAULT 'CUST-001',
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE TREES TABLE
CREATE TABLE public.trees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tree_code VARCHAR(20) UNIQUE NOT NULL DEFAULT 'TREE-001',
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Coconut Palm #1',
    species VARCHAR(100) DEFAULT 'King Coconut (Cocos nucifera)',
    location VARCHAR(100) DEFAULT 'East Plot - Sector 4',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CREATE DEVICES TABLE
CREATE TABLE public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_code VARCHAR(20) UNIQUE NOT NULL DEFAULT 'THM-0001',
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    tree_id UUID REFERENCES public.trees(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'OFFLINE', -- ONLINE, OFFLINE, TESTING
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    firmware_version VARCHAR(20) DEFAULT 'v2.0.0-FSR',
    battery_level INT DEFAULT NULL,
    signal_strength INT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CREATE SCHEDULES TABLE
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    time VARCHAR(10) NOT NULL, -- e.g., '08:00', '10:00'
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CREATE CHECK HISTORY TABLE (Motor & FSR 30s evaluation)
CREATE TABLE public.check_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_code VARCHAR(20) NOT NULL,
    tree_code VARCHAR(20) NOT NULL,
    check_type VARCHAR(20) NOT NULL,            -- 'MANUAL' or 'SCHEDULED'
    result VARCHAR(20) NOT NULL,                -- 'HEALTHY' or 'UNHEALTHY'
    detected BOOLEAN NOT NULL DEFAULT false,     -- true if FSR > 1000
    detection_time NUMERIC(5,2) DEFAULT 30.0,   -- exact seconds when threshold was crossed
    duration NUMERIC(5,2) DEFAULT 30.0,         -- total evaluation duration (30.0s)
    fsr_value INT DEFAULT NULL,                 -- peak analog force reading
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 7. SEED CLEAN BASELINE DATA (No fake history)
INSERT INTO public.customers (customer_code, name, email)
VALUES ('CUST-001', 'Coconut Farmer', 'demo@treehealth.com')
ON CONFLICT (customer_code) DO NOTHING;

INSERT INTO public.trees (tree_code, customer_id, name, species, location)
SELECT 'TREE-001', id, 'Coconut Palm #1', 'King Coconut (Cocos nucifera)', 'East Plot - Sector 4'
FROM public.customers WHERE customer_code = 'CUST-001'
ON CONFLICT (tree_code) DO NOTHING;

INSERT INTO public.devices (device_code, customer_id, tree_id, status, firmware_version, battery_level, signal_strength)
SELECT 'THM-0001', c.id, t.id, 'OFFLINE', 'v2.0.0-FSR', NULL, NULL
FROM public.customers c, public.trees t
WHERE c.customer_code = 'CUST-001' AND t.tree_code = 'TREE-001'
ON CONFLICT (device_code) DO NOTHING;

INSERT INTO public.schedules (device_id, time, enabled)
SELECT id, unnest(ARRAY['08:00', '10:00', '12:00', '14:00', '16:00', '18:00']), true
FROM public.devices WHERE device_code = 'THM-0001'
ON CONFLICT DO NOTHING;
