-- ============================================================
-- CareerLink OS™ — Supabase Schema
-- Job Search Compliance Dashboard + Jobseeker Activity PWA
-- Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
--
-- EXECUTION ORDER:
--   1. Extensions
--   2. Tables (with updated_at column)
--   3. Indexes
--   4. Functions (updated_at trigger fn)
--   5. Triggers
--   6. Enable RLS
--   7. RLS Policies (MVP: access token pattern)
--   8. Verification queries
--
-- RLS: ENABLED on all tables.
-- Auth strategy: MVP access-token mode.
--   Jobseeker PWA writes via valid public_link_id token.
--   Coach reads via anon key (read-only, org-scoped in production).
--   Full Supabase Auth should be added before handling
--   sensitive live personal data at production scale.
--
-- SECURITY NOTE:
--   Do NOT use SUPABASE_SERVICE_ROLE_KEY in frontend.
--   Only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
--   are permitted in frontend .env files.
-- ============================================================

-- ── 1. EXTENSIONS ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 2. TABLES ────────────────────────────────────────────────

-- 2.1 organisations
CREATE TABLE IF NOT EXISTS organisations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  programme        TEXT,
  contact_email    TEXT,
  settings         JSONB DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- 2.2 coaches
CREATE TABLE IF NOT EXISTS coaches (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id  UUID REFERENCES organisations(id) ON DELETE SET NULL,
  full_name        TEXT NOT NULL,
  email            TEXT UNIQUE,
  role             TEXT DEFAULT 'coach',
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- 2.3 jobseekers
CREATE TABLE IF NOT EXISTS jobseekers (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id      UUID REFERENCES organisations(id) ON DELETE SET NULL,
  coach_id             UUID REFERENCES coaches(id) ON DELETE SET NULL,
  display_name         TEXT NOT NULL,
  email                TEXT,
  phone                TEXT,
  status               TEXT DEFAULT 'active'
                         CHECK (status IN ('active','inactive','at_risk','on_hold','completed','placed')),
  programme            TEXT,
  weekly_target_hours  INTEGER DEFAULT 35,
  risk_level           TEXT DEFAULT 'low'
                         CHECK (risk_level IN ('low','medium','high','critical')),
  notes                TEXT,
  pwa_link_id          TEXT UNIQUE,          -- references pwa_access_links.public_link_id
  last_active_at       TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- 2.4 pwa_access_links
-- One row per jobseeker PWA link. public_link_id is the safe shareable token.
CREATE TABLE IF NOT EXISTS pwa_access_links (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_link_id  TEXT UNIQUE NOT NULL,      -- safe to share, non-guessable
  jobseeker_id    UUID REFERENCES jobseekers(id) ON DELETE CASCADE,
  is_active       BOOLEAN DEFAULT TRUE,
  expires_at      TIMESTAMPTZ,               -- NULL = never expires (MVP)
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 2.5 activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobseeker_id     UUID NOT NULL REFERENCES jobseekers(id) ON DELETE CASCADE,
  pwa_link_id      TEXT,                     -- the access token used at submission
  date             DATE NOT NULL,
  start_time       TEXT,
  end_time         TEXT,
  duration_minutes INTEGER DEFAULT 0,
  activity_type    TEXT NOT NULL,
  description      TEXT,
  notes            TEXT,
  evidence_ids     UUID[],
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- 2.6 weekly_activity_totals
-- Materialised weekly summary per jobseeker. Updated by trigger or manual upsert.
CREATE TABLE IF NOT EXISTS weekly_activity_totals (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobseeker_id         UUID NOT NULL REFERENCES jobseekers(id) ON DELETE CASCADE,
  week_start           DATE NOT NULL,         -- always a Monday
  total_minutes        INTEGER DEFAULT 0,
  target_minutes       INTEGER DEFAULT 2100,  -- 35h × 60
  completion_pct       NUMERIC(5,2) DEFAULT 0,
  activity_count       INTEGER DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  UNIQUE (jobseeker_id, week_start)
);

-- 2.7 applications
CREATE TABLE IF NOT EXISTS applications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobseeker_id  UUID NOT NULL REFERENCES jobseekers(id) ON DELETE CASCADE,
  pwa_link_id   TEXT,
  employer      TEXT,
  role_title    TEXT,
  source        TEXT,
  date_applied  DATE,
  status        TEXT DEFAULT 'Applied',
  evidence_ids  UUID[],
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 2.8 interviews
CREATE TABLE IF NOT EXISTS interviews (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobseeker_id      UUID NOT NULL REFERENCES jobseekers(id) ON DELETE CASCADE,
  pwa_link_id       TEXT,
  employer          TEXT,
  role_title        TEXT,
  interview_date    TIMESTAMPTZ,
  location_or_link  TEXT,
  preparation_tasks TEXT,
  outcome           TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- 2.9 check_ins
CREATE TABLE IF NOT EXISTS check_ins (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobseeker_id    UUID NOT NULL REFERENCES jobseekers(id) ON DELETE CASCADE,
  pwa_link_id     TEXT,
  check_in_date   DATE NOT NULL,
  answers         JSONB DEFAULT '{}'::jsonb,
  hours_reported  NUMERIC(5,2) DEFAULT 0,
  support_needed  BOOLEAN DEFAULT FALSE,
  barrier_flags   TEXT[],
  confidence_score INTEGER,                  -- 1–10
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 2.10 evidence_records
CREATE TABLE IF NOT EXISTS evidence_records (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobseeker_id      UUID NOT NULL REFERENCES jobseekers(id) ON DELETE CASCADE,
  pwa_link_id       TEXT,
  title             TEXT NOT NULL,
  evidence_type     TEXT,                    -- 'screenshot','note','url','document'
  linked_record_type TEXT,                   -- 'activity_log','application','interview'
  linked_record_id  UUID,
  evidence_date     DATE,
  notes             TEXT,
  file_url          TEXT,                    -- public URL only, no private secrets
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- 2.11 dashboard_events
-- Coach-visible timeline events generated from PWA submissions.
CREATE TABLE IF NOT EXISTS dashboard_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobseeker_id  UUID REFERENCES jobseekers(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  event_type    TEXT NOT NULL,
  summary       TEXT,
  payload       JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2.12 ai_insight_snapshots
-- 4P3X AI generated insight summaries. Human review required.
CREATE TABLE IF NOT EXISTS ai_insight_snapshots (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobseeker_id    UUID REFERENCES jobseekers(id) ON DELETE CASCADE,
  assistant_id    TEXT,                      -- 'coachDashboardGuide','coachDataInsight', etc.
  insight_type    TEXT,
  suggestion      TEXT,
  reason          TEXT,
  data_used       JSONB DEFAULT '{}'::jsonb,
  confidence      NUMERIC(3,2),
  human_review_required BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 3. INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_jobseekers_org    ON jobseekers(organisation_id);
CREATE INDEX IF NOT EXISTS idx_jobseekers_coach  ON jobseekers(coach_id);
CREATE INDEX IF NOT EXISTS idx_jobseekers_status ON jobseekers(status);
CREATE INDEX IF NOT EXISTS idx_jobseekers_risk   ON jobseekers(risk_level);
CREATE INDEX IF NOT EXISTS idx_pwa_links_link_id ON pwa_access_links(public_link_id);
CREATE INDEX IF NOT EXISTS idx_pwa_links_js      ON pwa_access_links(jobseeker_id);
CREATE INDEX IF NOT EXISTS idx_activity_js_date  ON activity_logs(jobseeker_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_date     ON activity_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_js_week    ON weekly_activity_totals(jobseeker_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_apps_js           ON applications(jobseeker_id, date_applied DESC);
CREATE INDEX IF NOT EXISTS idx_ivs_js            ON interviews(jobseeker_id, interview_date DESC);
CREATE INDEX IF NOT EXISTS idx_ci_js_date        ON check_ins(jobseeker_id, check_in_date DESC);
CREATE INDEX IF NOT EXISTS idx_ev_js             ON evidence_records(jobseeker_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_js         ON dashboard_events(jobseeker_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_org        ON dashboard_events(organisation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_js             ON ai_insight_snapshots(jobseeker_id, created_at DESC);

-- ── 4. FUNCTIONS ─────────────────────────────────────────────

-- 4.1 updated_at auto-update function
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.2 Recalculate weekly_activity_totals after activity_log insert/update
CREATE OR REPLACE FUNCTION recalculate_weekly_total()
RETURNS TRIGGER AS $$
DECLARE
  v_week_start DATE;
  v_total_min  INTEGER;
  v_count      INTEGER;
  v_target     INTEGER;
BEGIN
  -- Get the Monday of the activity's week
  v_week_start := DATE_TRUNC('week', COALESCE(NEW.date, OLD.date))::DATE;

  -- Sum all activity minutes for this jobseeker in this week
  SELECT
    COALESCE(SUM(duration_minutes), 0),
    COUNT(*)
  INTO v_total_min, v_count
  FROM activity_logs
  WHERE jobseeker_id = COALESCE(NEW.jobseeker_id, OLD.jobseeker_id)
    AND DATE_TRUNC('week', date) = DATE_TRUNC('week', v_week_start);

  -- Get weekly target from jobseeker record
  SELECT COALESCE(weekly_target_hours, 35) * 60
  INTO v_target
  FROM jobseekers
  WHERE id = COALESCE(NEW.jobseeker_id, OLD.jobseeker_id);

  -- Upsert weekly total
  INSERT INTO weekly_activity_totals
    (jobseeker_id, week_start, total_minutes, target_minutes, completion_pct, activity_count)
  VALUES (
    COALESCE(NEW.jobseeker_id, OLD.jobseeker_id),
    v_week_start,
    v_total_min,
    COALESCE(v_target, 2100),
    CASE WHEN COALESCE(v_target, 2100) > 0
         THEN LEAST(100, ROUND((v_total_min::NUMERIC / COALESCE(v_target, 2100)) * 100, 2))
         ELSE 0 END,
    v_count
  )
  ON CONFLICT (jobseeker_id, week_start)
  DO UPDATE SET
    total_minutes   = EXCLUDED.total_minutes,
    target_minutes  = EXCLUDED.target_minutes,
    completion_pct  = EXCLUDED.completion_pct,
    activity_count  = EXCLUDED.activity_count,
    updated_at      = now();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 5. TRIGGERS ──────────────────────────────────────────────

-- updated_at triggers
CREATE OR REPLACE TRIGGER tg_updated_organisations
  BEFORE UPDATE ON organisations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER tg_updated_coaches
  BEFORE UPDATE ON coaches
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER tg_updated_jobseekers
  BEFORE UPDATE ON jobseekers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER tg_updated_pwa_links
  BEFORE UPDATE ON pwa_access_links
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER tg_updated_activity_logs
  BEFORE UPDATE ON activity_logs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER tg_updated_weekly_totals
  BEFORE UPDATE ON weekly_activity_totals
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER tg_updated_applications
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER tg_updated_interviews
  BEFORE UPDATE ON interviews
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER tg_updated_check_ins
  BEFORE UPDATE ON check_ins
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER tg_updated_evidence
  BEFORE UPDATE ON evidence_records
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Weekly total recalculation trigger
CREATE OR REPLACE TRIGGER tg_weekly_total_on_activity
  AFTER INSERT OR UPDATE OR DELETE ON activity_logs
  FOR EACH ROW EXECUTE FUNCTION recalculate_weekly_total();

-- ── 6. ENABLE RLS ─────────────────────────────────────────────
ALTER TABLE organisations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches               ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobseekers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_access_links      ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_activity_totals ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins             ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_records      ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insight_snapshots  ENABLE ROW LEVEL SECURITY;

-- ── 7. RLS POLICIES ───────────────────────────────────────────
--
-- MVP: Access-token pattern (no Supabase Auth required yet).
--
-- Jobseeker PWA identifies itself via public_link_id query param.
-- INSERT policies check that the public_link_id in the record
-- matches an active pwa_access_links row.
--
-- SECURITY WARNING:
--   This is an MVP approach. Before deploying to production at scale
--   with real sensitive personal data, implement Supabase Auth
--   (phone/email OTP for jobseekers, email/password for coaches)
--   and replace these policies with auth.uid()-based policies.
--
-- ──────────────────────────────────────────────────────────────

-- 7.1 organisations — anon can read (coach dashboard reads org info)
CREATE POLICY "anon_read_organisations"
  ON organisations FOR SELECT
  TO anon
  USING (TRUE);

-- 7.2 coaches — anon read only
CREATE POLICY "anon_read_coaches"
  ON coaches FOR SELECT
  TO anon
  USING (TRUE);

-- 7.3 jobseekers — anon read; anon insert only via valid pwa link
CREATE POLICY "anon_read_jobseekers"
  ON jobseekers FOR SELECT
  TO anon
  USING (TRUE);

-- 7.4 pwa_access_links — anon can SELECT active links (needed for PWA to verify token)
CREATE POLICY "anon_read_active_pwa_links"
  ON pwa_access_links FOR SELECT
  TO anon
  USING (is_active = TRUE);

-- 7.5 activity_logs — read all (coach dashboard); insert only if pwa_link_id is valid & active
CREATE POLICY "anon_read_activity_logs"
  ON activity_logs FOR SELECT
  TO anon
  USING (TRUE);

CREATE POLICY "anon_insert_activity_log_via_valid_link"
  ON activity_logs FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pwa_access_links pal
      WHERE pal.public_link_id = activity_logs.pwa_link_id
        AND pal.is_active = TRUE
        AND (pal.expires_at IS NULL OR pal.expires_at > now())
    )
  );

-- 7.6 weekly_activity_totals — read only (updated by trigger/service)
CREATE POLICY "anon_read_weekly_totals"
  ON weekly_activity_totals FOR SELECT
  TO anon
  USING (TRUE);

-- 7.7 applications — read all; insert via valid link
CREATE POLICY "anon_read_applications"
  ON applications FOR SELECT
  TO anon
  USING (TRUE);

CREATE POLICY "anon_insert_application_via_valid_link"
  ON applications FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pwa_access_links pal
      WHERE pal.public_link_id = applications.pwa_link_id
        AND pal.is_active = TRUE
        AND (pal.expires_at IS NULL OR pal.expires_at > now())
    )
  );

-- 7.8 interviews
CREATE POLICY "anon_read_interviews"
  ON interviews FOR SELECT
  TO anon
  USING (TRUE);

CREATE POLICY "anon_insert_interview_via_valid_link"
  ON interviews FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pwa_access_links pal
      WHERE pal.public_link_id = interviews.pwa_link_id
        AND pal.is_active = TRUE
        AND (pal.expires_at IS NULL OR pal.expires_at > now())
    )
  );

-- 7.9 check_ins
CREATE POLICY "anon_read_check_ins"
  ON check_ins FOR SELECT
  TO anon
  USING (TRUE);

CREATE POLICY "anon_insert_check_in_via_valid_link"
  ON check_ins FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pwa_access_links pal
      WHERE pal.public_link_id = check_ins.pwa_link_id
        AND pal.is_active = TRUE
        AND (pal.expires_at IS NULL OR pal.expires_at > now())
    )
  );

-- 7.10 evidence_records
CREATE POLICY "anon_read_evidence"
  ON evidence_records FOR SELECT
  TO anon
  USING (TRUE);

CREATE POLICY "anon_insert_evidence_via_valid_link"
  ON evidence_records FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pwa_access_links pal
      WHERE pal.public_link_id = evidence_records.pwa_link_id
        AND pal.is_active = TRUE
        AND (pal.expires_at IS NULL OR pal.expires_at > now())
    )
  );

-- 7.11 dashboard_events — read only for anon (coach dashboard feed)
CREATE POLICY "anon_read_dashboard_events"
  ON dashboard_events FOR SELECT
  TO anon
  USING (TRUE);

-- 7.12 ai_insight_snapshots — read only
CREATE POLICY "anon_read_ai_insights"
  ON ai_insight_snapshots FOR SELECT
  TO anon
  USING (TRUE);

-- ── 8. DEMO SEED DATA (optional — comment out for clean production) ──
-- Only execute if you want demo/test rows in your Supabase instance.
-- All demo rows are clearly marked and can be deleted.

/*
-- Demo organisation
INSERT INTO organisations (id, name, programme, contact_email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'CareerLink Demo Organisation',
  'Restart Scheme',
  'demo@careerlinkos.example'
) ON CONFLICT (id) DO NOTHING;

-- Demo coach
INSERT INTO coaches (id, organisation_id, full_name, email, role)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Demo Coach',
  'coach@careerlinkos.example',
  'coach'
) ON CONFLICT (id) DO NOTHING;

-- Demo jobseeker
INSERT INTO jobseekers (id, organisation_id, coach_id, display_name, email, status, programme, weekly_target_hours, risk_level, pwa_link_id)
VALUES (
  '00000000-0000-0000-0000-000000000100',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000010',
  'Jordan Mitchell (Demo)',
  'jordan@demo.careerlinkos',
  'active',
  'Restart Scheme',
  35,
  'low',
  'demo-jordan-001'
) ON CONFLICT (id) DO NOTHING;

-- Demo PWA access link
INSERT INTO pwa_access_links (public_link_id, jobseeker_id, is_active)
VALUES ('demo-jordan-001', '00000000-0000-0000-0000-000000000100', TRUE)
ON CONFLICT (public_link_id) DO NOTHING;
*/

-- ── 9. VERIFICATION QUERIES ───────────────────────────────────
-- Run these after executing the schema to verify setup:

/*
SELECT 'organisations'        AS tbl, COUNT(*) FROM organisations
UNION ALL
SELECT 'coaches',               COUNT(*) FROM coaches
UNION ALL
SELECT 'jobseekers',            COUNT(*) FROM jobseekers
UNION ALL
SELECT 'pwa_access_links',      COUNT(*) FROM pwa_access_links
UNION ALL
SELECT 'activity_logs',         COUNT(*) FROM activity_logs
UNION ALL
SELECT 'weekly_activity_totals',COUNT(*) FROM weekly_activity_totals
UNION ALL
SELECT 'applications',          COUNT(*) FROM applications
UNION ALL
SELECT 'interviews',            COUNT(*) FROM interviews
UNION ALL
SELECT 'check_ins',             COUNT(*) FROM check_ins
UNION ALL
SELECT 'evidence_records',      COUNT(*) FROM evidence_records
UNION ALL
SELECT 'dashboard_events',      COUNT(*) FROM dashboard_events
UNION ALL
SELECT 'ai_insight_snapshots',  COUNT(*) FROM ai_insight_snapshots;

-- Verify RLS is enabled:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'organisations','coaches','jobseekers','pwa_access_links',
    'activity_logs','weekly_activity_totals','applications',
    'interviews','check_ins','evidence_records',
    'dashboard_events','ai_insight_snapshots'
  )
ORDER BY tablename;
*/
