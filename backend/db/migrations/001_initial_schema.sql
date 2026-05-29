-- ============================================================================
-- 001_initial_schema.sql
-- PostgREST API Backend — Initial PostgreSQL Schema
-- ============================================================================
-- This migration sets up the 'api' schema (exposed by PostgREST) and creates
-- application tables alongside the 'public' schema used by Ory Kratos.
-- RLS is enforced on all tables; policies use JWT claims from PostgREST.
-- ============================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- SCHEMA MANAGEMENT
-- --------------------------------------------------------------------------

-- The 'public' schema is left for Ory Kratos identity tables.
-- The 'api' schema is what PostgREST exposes via db-schema.
CREATE SCHEMA IF NOT EXISTS api;

-- Create the dedicated PostgREST authenticator role and the anonymous role.
-- The authenticator is the role PostgREST connects with; it switches to
-- the anonymous role (or the user's role) based on JWT claims.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgrest') THEN
        CREATE ROLE postgrest WITH LOGIN NOINHERIT PASSWORD 'postgrest_password';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anonymous') THEN
        CREATE ROLE anonymous WITH NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated_user') THEN
        CREATE ROLE authenticated_user WITH NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_user') THEN
        CREATE ROLE admin_user WITH NOLOGIN;
    END IF;
END
$$;

-- Grant schema usage to roles. PostgREST's authenticator inherits from the
-- JWT-specified role (anonymous, authenticated_user, or admin_user).
GRANT USAGE ON SCHEMA api TO postgrest;
GRANT USAGE ON SCHEMA api TO anonymous;
GRANT USAGE ON SCHEMA api TO authenticated_user;
GRANT USAGE ON SCHEMA api TO admin_user;

-- All api tables will be owned by the postgrest role for simplicity,
-- but RLS ensures the JWT-mapped roles can only do what's allowed.
ALTER SCHEMA api OWNER TO postgrest;

-- --------------------------------------------------------------------------
-- EXTENSIONS
-- --------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto"  WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- --------------------------------------------------------------------------
-- HELPER: updated_at trigger function (set on every row UPDATE)
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION api.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now() AT TIME ZONE 'utc';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------------
-- TABLE: users
-- Core user record linked to Ory Kratos identity via kratos_id.
-- --------------------------------------------------------------------------

CREATE TABLE api.users (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT        NOT NULL,
    name        TEXT        NOT NULL,
    role        TEXT        NOT NULL DEFAULT 'user'
                            CHECK (role IN ('admin', 'user', 'viewer')),
    avatar_url  TEXT,
    company     TEXT,
    kratos_id   UUID,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraints
ALTER TABLE api.users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE api.users ADD CONSTRAINT users_kratos_id_key UNIQUE (kratos_id);

-- Indexes
CREATE INDEX idx_users_kratos_id  ON api.users (kratos_id);
CREATE INDEX idx_users_role       ON api.users (role);
CREATE INDEX idx_users_created_at ON api.users (created_at DESC);

-- Trigger
CREATE TRIGGER trg_users_set_updated_at
    BEFORE UPDATE ON api.users
    FOR EACH ROW
    EXECUTE FUNCTION api.set_updated_at();

-- RLS
ALTER TABLE api.users ENABLE ROW LEVEL SECURITY;

-- Admins can see all users; users can see their own record.
CREATE POLICY users_select_policy ON api.users FOR SELECT
    USING (
        current_setting('request.jwt.claim.role', true) = 'admin'
        OR id = (current_setting('request.jwt.claim.sub', true))::UUID
    );

-- Admins can insert new users.
CREATE POLICY users_insert_policy ON api.users FOR INSERT
    WITH CHECK (
        current_setting('request.jwt.claim.role', true) = 'admin'
    );

-- Admins can update any user; users can update their own basic fields.
CREATE POLICY users_update_policy ON api.users FOR UPDATE
    USING (
        current_setting('request.jwt.claim.role', true) = 'admin'
        OR id = (current_setting('request.jwt.claim.sub', true))::UUID
    )
    WITH CHECK (
        current_setting('request.jwt.claim.role', true) = 'admin'
        OR id = (current_setting('request.jwt.claim.sub', true))::UUID
    );

-- Only admins may delete users.
CREATE POLICY users_delete_policy ON api.users FOR DELETE
    USING (
        current_setting('request.jwt.claim.role', true) = 'admin'
    );

-- --------------------------------------------------------------------------
-- TABLE: profiles
-- Extended profile data for each user (1:1 with api.users).
-- --------------------------------------------------------------------------

CREATE TABLE api.profiles (
    user_id     UUID        PRIMARY KEY
                            REFERENCES api.users(id) ON DELETE CASCADE,
    bio         TEXT,
    phone       TEXT,
    settings    JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on phone for lookups
CREATE INDEX idx_profiles_phone ON api.profiles (phone);

-- GIN index on settings JSONB for queries against dynamic keys
CREATE INDEX idx_profiles_settings ON api.profiles USING GIN (settings);

-- Trigger
CREATE TRIGGER trg_profiles_set_updated_at
    BEFORE UPDATE ON api.profiles
    FOR EACH ROW
    EXECUTE FUNCTION api.set_updated_at();

-- RLS
ALTER TABLE api.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_policy ON api.profiles FOR SELECT
    USING (
        current_setting('request.jwt.claim.role', true) = 'admin'
        OR user_id = (current_setting('request.jwt.claim.sub', true))::UUID
    );

CREATE POLICY profiles_insert_policy ON api.profiles FOR INSERT
    WITH CHECK (
        user_id = (current_setting('request.jwt.claim.sub', true))::UUID
        OR current_setting('request.jwt.claim.role', true) = 'admin'
    );

CREATE POLICY profiles_update_policy ON api.profiles FOR UPDATE
    USING (
        user_id = (current_setting('request.jwt.claim.sub', true))::UUID
        OR current_setting('request.jwt.claim.role', true) = 'admin'
    )
    WITH CHECK (
        user_id = (current_setting('request.jwt.claim.sub', true))::UUID
        OR current_setting('request.jwt.claim.role', true) = 'admin'
    );

CREATE POLICY profiles_delete_policy ON api.profiles FOR DELETE
    USING (
        current_setting('request.jwt.claim.role', true) = 'admin'
    );

-- --------------------------------------------------------------------------
-- TABLE: audit_logs
-- Immutable audit trail for security-sensitive actions.
-- --------------------------------------------------------------------------

CREATE TABLE api.audit_logs (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        REFERENCES api.users(id) ON DELETE SET NULL,
    action      TEXT        NOT NULL,
    resource    TEXT        NOT NULL,
    details     JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_audit_logs_user_id    ON api.audit_logs (user_id);
CREATE INDEX idx_audit_logs_action     ON api.audit_logs (action);
CREATE INDEX idx_audit_logs_resource   ON api.audit_logs (resource);
CREATE INDEX idx_audit_logs_created_at ON api.audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_details    ON api.audit_logs USING GIN (details);

-- RLS
ALTER TABLE api.audit_logs ENABLE ROW LEVEL SECURITY;

-- Everyone can insert audit logs (for capturing actions).
CREATE POLICY audit_logs_insert_policy ON api.audit_logs FOR INSERT
    WITH CHECK (true);

-- Admins can read all; users can read their own.
CREATE POLICY audit_logs_select_policy ON api.audit_logs FOR SELECT
    USING (
        current_setting('request.jwt.claim.role', true) = 'admin'
        OR user_id = (current_setting('request.jwt.claim.sub', true))::UUID
    );

-- Audit logs are immutable — no UPDATE or DELETE policies.
-- (Every row is inserted once and never modified.)

-- --------------------------------------------------------------------------
-- TABLE: api_keys
-- Long-lived API keys (hashed) for programmatic access.
-- --------------------------------------------------------------------------

CREATE TABLE api.api_keys (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL
                            REFERENCES api.users(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    key_hash    TEXT        NOT NULL,
    last_used   TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraints
ALTER TABLE api.api_keys ADD CONSTRAINT api_keys_key_hash_key UNIQUE (key_hash);

-- Indexes
CREATE INDEX idx_api_keys_user_id ON api.api_keys (user_id);
CREATE INDEX idx_api_keys_name    ON api.api_keys (name);

-- RLS
ALTER TABLE api.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY api_keys_select_policy ON api.api_keys FOR SELECT
    USING (
        current_setting('request.jwt.claim.role', true) = 'admin'
        OR user_id = (current_setting('request.jwt.claim.sub', true))::UUID
    );

CREATE POLICY api_keys_insert_policy ON api.api_keys FOR INSERT
    WITH CHECK (
        user_id = (current_setting('request.jwt.claim.sub', true))::UUID
        OR current_setting('request.jwt.claim.role', true) = 'admin'
    );

CREATE POLICY api_keys_update_policy ON api.api_keys FOR UPDATE
    USING (
        user_id = (current_setting('request.jwt.claim.sub', true))::UUID
        OR current_setting('request.jwt.claim.role', true) = 'admin'
    )
    WITH CHECK (
        user_id = (current_setting('request.jwt.claim.sub', true))::UUID
        OR current_setting('request.jwt.claim.role', true) = 'admin'
    );

CREATE POLICY api_keys_delete_policy ON api.api_keys FOR DELETE
    USING (
        user_id = (current_setting('request.jwt.claim.sub', true))::UUID
        OR current_setting('request.jwt.claim.role', true) = 'admin'
    );

-- --------------------------------------------------------------------------
-- GRANTS (api schema)
-- --------------------------------------------------------------------------

-- Grant default privileges so future objects are also accessible.
ALTER DEFAULT PRIVILEGES IN SCHEMA api
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA api
    GRANT ALL PRIVILEGES ON TABLES TO admin_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA api
    GRANT SELECT ON TABLES TO anonymous;

-- Explicit table grants for the roles PostgREST switches into.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA api TO admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA api TO authenticated_user;
GRANT SELECT ON ALL TABLES IN SCHEMA api TO anonymous;

-- Sequences (needed for INSERT .. RETURNING with serial columns, though we
-- primarily use UUIDs — grants are included for completeness).
GRANT USAGE ON ALL SEQUENCES IN SCHEMA api TO admin_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA api TO authenticated_user;

-- --------------------------------------------------------------------------
-- VERIFICATION
-- --------------------------------------------------------------------------

-- Sanity check: confirm the expected tables exist.
DO $$
DECLARE
    missing_tables TEXT[];
BEGIN
    missing_tables := '{}';

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'api' AND table_name = 'users') THEN
        missing_tables := missing_tables || 'users';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'api' AND table_name = 'profiles') THEN
        missing_tables := missing_tables || 'profiles';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'api' AND table_name = 'audit_logs') THEN
        missing_tables := missing_tables || 'audit_logs';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'api' AND table_name = 'api_keys') THEN
        missing_tables := missing_tables || 'api_keys';
    END IF;

    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Migration failed: tables missing in api schema: %',
            array_to_string(missing_tables, ', ');
    END IF;
END
$$;

COMMIT;
