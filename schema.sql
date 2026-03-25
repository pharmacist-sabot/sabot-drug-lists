-- ============================================================
-- schema.sql — Migration สำหรับระบบ Smart Drug List
-- โรงพยาบาลสระโบสถ์ (Sabot Hospital)
-- ============================================================
-- วิธีใช้: รันไฟล์นี้ใน Supabase SQL Editor หรือ psql
-- ลำดับการ migrate:
--   1. เพิ่มคอลัมน์ใหม่ใน public.drugs
--   2. สร้างตาราง public.drug_changelog
--   3. สร้าง Indexes
--   4. ตั้งค่า RLS (Row Level Security)
--   5. สร้าง Function get_activity_stats
--   6. สร้าง Trigger Function + Trigger สำหรับ Auto-logging
--   7. Grant สิทธิ์ที่จำเป็น
-- ============================================================

-- ============================================================
-- SECTION 1: เพิ่มคอลัมน์ใหม่ในตาราง public.drugs
-- ============================================================

-- เพิ่มคอลัมน์ created_at (TIMESTAMPTZ)
-- — แถวที่มีอยู่เดิมจะได้ NULL (ไม่ยัดเวลาปัจจุบันเพื่อป้องกันความสับสน)
-- — แถวใหม่ที่เพิ่มในอนาคตจะได้ NOW() อัตโนมัติ
ALTER TABLE public.drugs
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NULL;

-- ตั้งค่า DEFAULT NOW() สำหรับการ INSERT ในอนาคต
-- (แถวเก่าที่มีอยู่แล้วจะยังคงเป็น NULL ตามที่ตั้งใจไว้)
ALTER TABLE public.drugs
  ALTER COLUMN created_at SET DEFAULT NOW();

-- เพิ่มคอลัมน์ notes (TEXT) สำหรับบันทึกข้อมูลเพิ่มเติมของยา
-- — แยกจาก remarks ซึ่งใช้สำหรับเหตุผลการ Decommission โดยเฉพาะ
ALTER TABLE public.drugs
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL;


-- ============================================================
-- SECTION 2: สร้างตาราง public.drug_changelog
-- ============================================================
-- ตารางนี้บันทึก Log การเปลี่ยนแปลงทุกครั้งที่มีการเพิ่ม/แก้ไข/ปิดการใช้งานยา
-- Trigger จะเป็นตัว INSERT เข้ามาโดยอัตโนมัติ (ไม่ต้อง INSERT เอง)

CREATE TABLE IF NOT EXISTS public.drug_changelog (
  -- Primary Key
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- อ้างอิงไปยังยาในตาราง drugs (SET NULL เมื่อยาถูกลบ เพื่อเก็บประวัติไว้)
  drug_id         UUID        REFERENCES public.drugs(id) ON DELETE SET NULL,

  -- สำเนาข้อมูลสำคัญของยา ณ เวลาที่เปลี่ยนแปลง (เผื่อ drug_id กลายเป็น NULL)
  drug_code       TEXT        NOT NULL,
  trade_name      TEXT,
  generic_name    TEXT,
  category        TEXT,

  -- ประเภทของการเปลี่ยนแปลง
  action          TEXT        NOT NULL
                    CHECK (action IN (
                      'added',           -- เพิ่มยาใหม่
                      'imported',        -- นำเข้าจาก CSV
                      'updated',         -- แก้ไขข้อมูลยา
                      'decommissioned',  -- ปิดการใช้งานยา
                      'recommissioned'   -- เปิดการใช้งานยาอีกครั้ง
                    )),

  -- ผู้ที่ทำการเปลี่ยนแปลง (SET NULL เมื่อ user ถูกลบ)
  changed_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_email TEXT,      -- เก็บ Email ไว้เผื่อ user ถูกลบออกจาก auth.users

  -- เวลาที่เปลี่ยนแปลง
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- หมายเหตุ (เช่น เหตุผลการ Decommission)
  remarks         TEXT,

  -- Snapshot ข้อมูลยาทั้งหมด ณ เวลาที่เปลี่ยนแปลง (สำหรับ Audit trail)
  snapshot        JSONB
);

COMMENT ON TABLE public.drug_changelog IS
  'บันทึก Log การเปลี่ยนแปลงข้อมูลยาทุกครั้ง สร้างโดย Trigger อัตโนมัติ';

COMMENT ON COLUMN public.drug_changelog.snapshot IS
  'Snapshot ข้อมูลยา (NEW record) ทั้งหมด ณ เวลาที่เกิดการเปลี่ยนแปลง';

COMMENT ON COLUMN public.drug_changelog.drug_id IS
  'FK ไปยัง drugs.id — กลายเป็น NULL ถ้ายาถูกลบออกจากระบบ แต่ประวัติจะยังคงอยู่';

COMMENT ON COLUMN public.drug_changelog.changed_by IS
  'FK ไปยัง auth.users.id — กลายเป็น NULL ถ้า user ถูกลบ ใช้ changed_by_email แทน';


-- ============================================================
-- SECTION 3: สร้าง Indexes เพื่อเพิ่มประสิทธิภาพการ Query
-- ============================================================

-- Index สำหรับ drugs.created_at (ใช้ใน Activity Report — ดูยาที่เพิ่มใหม่)
CREATE INDEX IF NOT EXISTS idx_drugs_created_at
  ON public.drugs (created_at DESC);

-- Index สำหรับ drugs.decommissioned_at (ใช้กรองยาที่ถูกปิดการใช้งาน)
-- NULLS LAST เพื่อให้ยาที่ active (decommissioned_at = NULL) ไม่รบกวน sort
CREATE INDEX IF NOT EXISTS idx_drugs_decommissioned_at
  ON public.drugs (decommissioned_at DESC NULLS LAST);

-- Composite Index สำหรับกรอง Active drugs + เรียงตามวันที่เพิ่ม
CREATE INDEX IF NOT EXISTS idx_drugs_active_created
  ON public.drugs (is_active, created_at DESC);

-- Index หลักของ drug_changelog — ใช้เรียงรายการล่าสุดก่อน
CREATE INDEX IF NOT EXISTS idx_drug_changelog_changed_at
  ON public.drug_changelog (changed_at DESC);

-- Index สำหรับค้นหา Log ของยาแต่ละรายการ
CREATE INDEX IF NOT EXISTS idx_drug_changelog_drug_id
  ON public.drug_changelog (drug_id);

-- Composite Index สำหรับ Filter ตาม action + เรียงตามเวลา
-- (เช่น ดูเฉพาะ action='decommissioned' ล่าสุด)
CREATE INDEX IF NOT EXISTS idx_drug_changelog_action
  ON public.drug_changelog (action, changed_at DESC);


-- ============================================================
-- SECTION 4: Row Level Security (RLS)
-- ============================================================

-- ── 4a. ตาราง public.drugs ──────────────────────────────────

-- เปิด RLS (ถ้ายังไม่ได้เปิด)
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;

-- ลบ Policy เดิมทั้งหมดออกก่อน เพื่อป้องกัน Conflict
DROP POLICY IF EXISTS "drugs_select_all"         ON public.drugs;
DROP POLICY IF EXISTS "drugs_insert_admin_only"  ON public.drugs;
DROP POLICY IF EXISTS "drugs_update_admin_only"  ON public.drugs;
DROP POLICY IF EXISTS "drugs_delete_admin_only"  ON public.drugs;
-- ลบชื่อเก่าที่อาจมีอยู่ก่อนหน้า (safety net)
DROP POLICY IF EXISTS "Allow read for all"       ON public.drugs;
DROP POLICY IF EXISTS "Allow insert for admin"   ON public.drugs;
DROP POLICY IF EXISTS "Allow update for admin"   ON public.drugs;
DROP POLICY IF EXISTS "Allow delete for admin"   ON public.drugs;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.drugs;

-- SELECT: ทุกคนดูรายการยาได้ (public catalog)
CREATE POLICY "drugs_select_all"
  ON public.drugs
  FOR SELECT
  USING (true);

-- INSERT: เฉพาะ Admin ของระบบเท่านั้น
CREATE POLICY "drugs_insert_admin_only"
  ON public.drugs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles_drugcupsabot
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- UPDATE: เฉพาะ Admin ของระบบเท่านั้น
CREATE POLICY "drugs_update_admin_only"
  ON public.drugs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles_drugcupsabot
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- DELETE: เฉพาะ Admin ของระบบเท่านั้น
CREATE POLICY "drugs_delete_admin_only"
  ON public.drugs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles_drugcupsabot
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );


-- ── 4b. ตาราง public.drug_changelog ────────────────────────

-- เปิด RLS
ALTER TABLE public.drug_changelog ENABLE ROW LEVEL SECURITY;

-- ลบ Policy เดิมออกก่อน
DROP POLICY IF EXISTS "changelog_select_authenticated"  ON public.drug_changelog;
DROP POLICY IF EXISTS "changelog_insert_admin_only"     ON public.drug_changelog;

-- SELECT: ต้อง Login แล้วเท่านั้นถึงจะดู Log ได้
CREATE POLICY "changelog_select_authenticated"
  ON public.drug_changelog
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: เฉพาะ Admin (และ Trigger SECURITY DEFINER จะ Bypass ได้อยู่แล้ว)
-- Policy นี้เป็น Safety net กรณีมีการ INSERT ตรงผ่าน API
CREATE POLICY "changelog_insert_admin_only"
  ON public.drug_changelog
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles_drugcupsabot
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );


-- ============================================================
-- SECTION 5: Function get_activity_stats
-- ============================================================
-- คืนค่า JSON สรุปสถิติการเปลี่ยนแปลงในช่วงเวลาที่กำหนด
-- ใช้ใน Dashboard แสดง KPI Cards

CREATE OR REPLACE FUNCTION public.get_activity_stats(
  p_from_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_to_date   TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON
LANGUAGE sql
STABLE          -- ผลลัพธ์คงที่ตลอด Transaction เดียวกัน (ช่วย Cache)
SECURITY DEFINER -- รันในฐานะ owner เพื่อ Bypass RLS ตอน COUNT
SET search_path = public
AS $$
  SELECT json_build_object(
    -- จำนวนยาที่ Active ทั้งหมดในระบบ (ณ ปัจจุบัน ไม่จำกัดช่วงเวลา)
    'total_active',  (
      SELECT COUNT(*)::INT
      FROM public.drugs
      WHERE is_active = true
    ),
    -- จำนวนยาที่ถูกเพิ่มใหม่ในช่วงเวลาที่กำหนด
    -- (created_at NOT NULL = ยาที่เพิ่มหลัง Migration นี้)
    'added_count',   (
      SELECT COUNT(*)::INT
      FROM public.drugs
      WHERE created_at IS NOT NULL
        AND created_at >= p_from_date
        AND created_at <= p_to_date
    ),
    -- จำนวนยาที่ถูกปิดการใช้งานในช่วงเวลาที่กำหนด
    'removed_count', (
      SELECT COUNT(*)::INT
      FROM public.drugs
      WHERE is_active = false
        AND decommissioned_at IS NOT NULL
        AND decommissioned_at >= p_from_date
        AND decommissioned_at <= p_to_date
    )
  );
$$;

COMMENT ON FUNCTION public.get_activity_stats IS
  'คืนค่าสถิติสรุป: จำนวนยา Active ทั้งหมด, ยาที่เพิ่มใหม่, ยาที่ Decommission ในช่วงเวลาที่กำหนด';


-- ============================================================
-- SECTION 6: Trigger Function + Trigger สำหรับ Auto-logging
-- ============================================================

-- ── 6a. Trigger Function ────────────────────────────────────
-- ทำงานทุกครั้งที่มี INSERT หรือ UPDATE บนตาราง drugs
-- บันทึก Log เข้า drug_changelog โดยอัตโนมัติ

CREATE OR REPLACE FUNCTION public.fn_log_drug_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- รันในฐานะ owner เพื่อสามารถ INSERT เข้า changelog ได้เสมอ
SET search_path = public
AS $$
DECLARE
  v_action        TEXT;
  v_user_id       UUID;
  v_user_email    TEXT;
BEGIN
  -- ดึงข้อมูล User ที่กำลัง Login อยู่จาก JWT
  v_user_id    := auth.uid();
  v_user_email := auth.jwt() ->> 'email';

  -- ── กรณี INSERT (เพิ่มยาใหม่) ─────────────────────────
  IF TG_OP = 'INSERT' THEN
    -- ถ้า Insert มาแล้ว is_active = false แสดงว่า Import มาพร้อมสถานะปิด
    IF NEW.is_active = false THEN
      v_action := 'decommissioned';
    ELSE
      v_action := 'added';
    END IF;

  -- ── กรณี UPDATE (แก้ไขข้อมูลยา) ──────────────────────
  ELSIF TG_OP = 'UPDATE' THEN
    -- ตรวจจับการ Decommission: is_active เปลี่ยนจาก true → false
    IF OLD.is_active = true AND NEW.is_active = false THEN
      v_action := 'decommissioned';

    -- ตรวจจับการ Recommission: is_active เปลี่ยนจาก false → true
    ELSIF OLD.is_active = false AND NEW.is_active = true THEN
      v_action := 'recommissioned';

    -- กรณีอื่น ๆ = การแก้ไขข้อมูลทั่วไป
    ELSE
      v_action := 'updated';
    END IF;

  END IF;

  -- บันทึก Log เข้าตาราง drug_changelog
  INSERT INTO public.drug_changelog (
    drug_id,
    drug_code,
    trade_name,
    generic_name,
    category,
    action,
    changed_by,
    changed_by_email,
    changed_at,
    remarks,
    snapshot
  ) VALUES (
    NEW.id,
    NEW.drug_code,
    NEW.trade_name,
    NEW.generic_name,
    NEW.category,
    v_action,
    v_user_id,
    v_user_email,
    NOW(),
    -- remarks ใช้เหตุผล Decommission (NEW.remarks) สำหรับ action ที่เกี่ยวข้อง
    CASE
      WHEN v_action IN ('decommissioned', 'recommissioned') THEN NEW.remarks
      ELSE NULL
    END,
    -- Snapshot ข้อมูลยาทั้งหมด ณ เวลาที่เปลี่ยนแปลง (แปลง Record เป็น JSONB)
    to_jsonb(NEW)
  );

  -- Trigger AFTER ไม่ต้อง RETURN NEW/OLD แต่ต้อง return อะไรสักอย่าง
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_log_drug_change IS
  'Trigger function: บันทึก Log ทุกการเปลี่ยนแปลงใน drugs เข้า drug_changelog อัตโนมัติ';


-- ── 6b. สร้าง Trigger ──────────────────────────────────────
-- ลบ Trigger เดิมก่อน (ถ้ามี) เพื่อป้องกัน Duplicate
DROP TRIGGER IF EXISTS trg_log_drug_change ON public.drugs;

-- สร้าง Trigger ใหม่: ทำงาน AFTER INSERT หรือ UPDATE ทุก Row
CREATE TRIGGER trg_log_drug_change
  AFTER INSERT OR UPDATE
  ON public.drugs
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_log_drug_change();

COMMENT ON TRIGGER trg_log_drug_change ON public.drugs IS
  'เรียก fn_log_drug_change() หลัง INSERT หรือ UPDATE ทุกแถวในตาราง drugs';


-- ============================================================
-- SECTION 7: Grant สิทธิ์การเข้าถึง
-- ============================================================

-- drug_changelog: อนุญาตให้ authenticated users ดูได้ และ INSERT ได้
-- (INSERT จะถูก RLS กรอง — เฉพาะ admin เท่านั้น นอกจาก Trigger SECURITY DEFINER)
GRANT SELECT, INSERT ON public.drug_changelog TO authenticated;

-- get_activity_stats: ทั้ง authenticated และ anon เรียกได้
-- (ใช้แสดงสถิติบนหน้า Public ถ้าจำเป็น)
GRANT EXECUTE ON FUNCTION public.get_activity_stats TO authenticated, anon;

-- fn_log_drug_change: ไม่ต้อง Grant เพราะเป็น SECURITY DEFINER และเรียกผ่าน Trigger เท่านั้น


-- ============================================================
-- SECTION 8: Verification Queries (ตรวจสอบผลลัพธ์หลัง Migrate)
-- ============================================================
-- รันเพื่อยืนยันว่า Migration สำเร็จ — ไม่ได้รันอัตโนมัติ

/*

-- 8.1 ตรวจสอบคอลัมน์ใหม่ใน public.drugs
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'drugs'
  AND column_name  IN ('created_at', 'notes')
ORDER BY column_name;
-- คาดหวัง: เห็น created_at (timestamptz, default: now()) และ notes (text, nullable)

-- 8.2 ตรวจสอบโครงสร้างตาราง drug_changelog
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'drug_changelog'
ORDER BY ordinal_position;
-- คาดหวัง: เห็นทุกคอลัมน์ตามที่กำหนด

-- 8.3 ตรวจสอบ Indexes ที่สร้างขึ้น
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_drugs_created_at',
    'idx_drugs_decommissioned_at',
    'idx_drugs_active_created',
    'idx_drug_changelog_changed_at',
    'idx_drug_changelog_drug_id',
    'idx_drug_changelog_action'
  )
ORDER BY tablename, indexname;
-- คาดหวัง: เห็น 6 indexes

-- 8.4 ตรวจสอบ RLS Policies บน drugs
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename  = 'drugs'
ORDER BY policyname;
-- คาดหวัง: 4 policies (select, insert, update, delete)

-- 8.5 ตรวจสอบ RLS Policies บน drug_changelog
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename  = 'drug_changelog'
ORDER BY policyname;
-- คาดหวัง: 2 policies (select, insert)

-- 8.6 ทดสอบ Function get_activity_stats
SELECT public.get_activity_stats();
-- คาดหวัง: JSON มี keys: total_active, added_count, removed_count

-- 8.7 ทดสอบ get_activity_stats กับช่วงเวลากำหนดเอง
SELECT public.get_activity_stats(
  NOW() - INTERVAL '7 days',
  NOW()
);

-- 8.8 ตรวจสอบ Trigger
SELECT trigger_name, event_manipulation, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name   = 'trg_log_drug_change';
-- คาดหวัง: เห็น 2 rows (INSERT, UPDATE) หรือ 1 row แบบ INSERT OR UPDATE

-- 8.9 ตรวจสอบจำนวน Log ใน drug_changelog (หลังจาก insert/update ทดสอบ)
SELECT action, COUNT(*) AS cnt
FROM public.drug_changelog
GROUP BY action
ORDER BY cnt DESC;

-- 8.10 ดู Log ล่าสุด 10 รายการ
SELECT id, drug_code, action, changed_by_email, changed_at, remarks
FROM public.drug_changelog
ORDER BY changed_at DESC
LIMIT 10;

*/

-- ============================================================
-- END OF MIGRATION
-- โรงพยาบาลสระโบสถ์ (Sabot Hospital) — Smart Drug List System
-- ============================================================
