-- ============================================================================
-- 002_seed_data.sql
-- PostgREST API Backend — Seed Data
-- ============================================================================
-- Populates the api schema with sample data for development and testing.
-- Uses DO blocks with exception handling so the migration is idempotent.
-- ============================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- SAMPLE USERS
-- --------------------------------------------------------------------------

DO $$
DECLARE
    v_admin_id     UUID;
    v_user_id      UUID;
    v_kratos_id    UUID;
BEGIN
    -- -----------------------------------------------------------------------
    -- Admin user
    -- -----------------------------------------------------------------------
    INSERT INTO api.users (email, name, role, avatar_url, company, kratos_id)
    VALUES (
        'admin@example.com',
        'Admin User',
        'admin',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        'Admin Dashboard Inc.',
        '00000000-0000-0000-0000-000000000001'
    )
    ON CONFLICT (email) DO UPDATE
        SET name        = EXCLUDED.name,
            role        = EXCLUDED.role,
            avatar_url  = EXCLUDED.avatar_url,
            company     = EXCLUDED.company,
            kratos_id   = EXCLUDED.kratos_id
    RETURNING id INTO v_admin_id;

    -- If the row already existed and no update happened, fetch the id.
    IF v_admin_id IS NULL THEN
        SELECT id INTO v_admin_id
        FROM api.users
        WHERE email = 'admin@example.com';
    END IF;

    RAISE NOTICE 'Admin user ID: %', v_admin_id;

    -- Admin profile
    INSERT INTO api.profiles (user_id, bio, phone, settings)
    VALUES (
        v_admin_id,
        'Platform administrator with full access.',
        '+1-555-0100',
        '{"notifications": {"email": true, "slack": true}, "theme": "dark", "locale": "en-US"}'::jsonb
    )
    ON CONFLICT (user_id) DO UPDATE
        SET bio      = EXCLUDED.bio,
            phone    = EXCLUDED.phone,
            settings = EXCLUDED.settings;

    -- -----------------------------------------------------------------------
    -- Regular user
    -- -----------------------------------------------------------------------
    INSERT INTO api.users (email, name, role, avatar_url, company, kratos_id)
    VALUES (
        'user@example.com',
        'Jane Doe',
        'user',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
        'Acme Corp',
        '00000000-0000-0000-0000-000000000002'
    )
    ON CONFLICT (email) DO UPDATE
        SET name        = EXCLUDED.name,
            role        = EXCLUDED.role,
            avatar_url  = EXCLUDED.avatar_url,
            company     = EXCLUDED.company,
            kratos_id   = EXCLUDED.kratos_id
    RETURNING id INTO v_user_id;

    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id
        FROM api.users
        WHERE email = 'user@example.com';
    END IF;

    RAISE NOTICE 'Regular user ID: %', v_user_id;

    -- Regular user profile
    INSERT INTO api.profiles (user_id, bio, phone, settings)
    VALUES (
        v_user_id,
        'Frontend developer and dashboard user.',
        '+1-555-0200',
        '{"notifications": {"email": true, "slack": false}, "theme": "light", "locale": "en-US"}'::jsonb
    )
    ON CONFLICT (user_id) DO UPDATE
        SET bio      = EXCLUDED.bio,
            phone    = EXCLUDED.phone,
            settings = EXCLUDED.settings;

    -- -----------------------------------------------------------------------
    -- AUDIT LOG ENTRIES
    -- -----------------------------------------------------------------------

    -- Admin actions
    INSERT INTO api.audit_logs (user_id, action, resource, details)
    VALUES
        (v_admin_id, 'user.login',           '/auth/login',
         '{"ip": "192.168.1.100", "user_agent": "Mozilla/5.0", "method": "password"}'::jsonb),
        (v_admin_id, 'user.settings_update',  '/api/profiles',
         '{"changed_fields": ["theme", "notifications"], "previous": {"theme": "light"}}'::jsonb),
        (v_admin_id, 'api_key.created',       '/api/api_keys',
         '{"key_name": "production-ci", "expires_in_days": 365}'::jsonb),
        (v_admin_id, 'user.role_change',      '/api/users/' || v_user_id,
         '{"previous_role": "user", "new_role": "admin", "changed_by": "admin"}'::jsonb);

    -- Regular user actions
    INSERT INTO api.audit_logs (user_id, action, resource, details)
    VALUES
        (v_user_id, 'user.login',            '/auth/login',
         '{"ip": "10.0.0.55", "user_agent": "Chrome/120", "method": "oauth2"}'::jsonb),
        (v_user_id, 'user.profile_update',   '/api/profiles',
         '{"changed_fields": ["phone", "bio"]}'::jsonb),
        (v_user_id, 'api_key.created',       '/api/api_keys',
         '{"key_name": "dev-local", "expires_in_days": 30}'::jsonb),
        (v_user_id, 'report.export',         '/api/reports/usage',
         '{"format": "csv", "date_range": "2025-01-01..2025-01-31", "rows_exported": 1243}'::jsonb);

    -- System-level audit entries (no user_id)
    INSERT INTO api.audit_logs (action, resource, details)
    VALUES
        ('system.startup',       '/health',
         '{"version": "1.0.0", "duration_ms": 342}'::jsonb),
        ('system.backup',        '/admin/backup',
         '{"size_bytes": 456789012, "tables": ["users", "profiles", "audit_logs"]}'::jsonb);

    RAISE NOTICE 'Seed audit logs inserted.';

    -- -----------------------------------------------------------------------
    -- API KEYS
    -- -----------------------------------------------------------------------

    -- Admin keys
    INSERT INTO api.api_keys (user_id, name, key_hash, last_used)
    VALUES
        (v_admin_id,
         'production-ci',
         '$2b$12$LJ3m4ys3Lk0TSwHn5ovY6u1N7XpPqRzBcDfGhIjKlMnOpQrStUvWx', -- bcrypt of 'adm_sk_test_xxxxxxxxxxxx'
         now() - interval '2 hours')
    ON CONFLICT (name, user_id) DO NOTHING;

    INSERT INTO api.api_keys (user_id, name, key_hash)
    VALUES
        (v_admin_id,
         'staging-automation',
         '$2b$12$VwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTu') -- bcrypt of 'adm_sk_staging_yyyyyyyy'
    ON CONFLICT (name, user_id) DO NOTHING;

    -- Regular user keys
    INSERT INTO api.api_keys (user_id, name, key_hash, last_used)
    VALUES
        (v_user_id,
         'dev-local',
         '$2b$12$AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOp', -- bcrypt of 'usr_sk_dev_zzzzzzzz'
         now() - interval '1 day')
    ON CONFLICT (name, user_id) DO NOTHING;

    INSERT INTO api.api_keys (user_id, name, key_hash)
    VALUES
        (v_user_id,
         'mobile-app',
         '$2b$12$MnOpQrStUvWxYzAbCdEfGhIjKl1234567890MnOpQrStUvWxYzAb') -- bcrypt of 'usr_sk_mobile_wwwwwwww'
    ON CONFLICT (name, user_id) DO NOTHING;

    RAISE NOTICE 'Seed API keys inserted.';
    RAISE NOTICE 'Seed data migration complete.';
END
$$;

COMMIT;
