-- ============================================================================
-- MineSetu AI — Seed Data: Organizations, Mines, Personas, and Operational Baselines
-- Canonical Path: backend/supabase/seed/01_seed_data.sql
-- ============================================================================

-- 1. Organizations
INSERT INTO organizations (id, code, name, tier, headquarters_location, annual_target_mt)
VALUES
    ('11111111-1111-1111-1111-111111111101', 'MoC', 'Ministry of Coal', 'ministry', 'Shastri Bhawan, New Delhi', 1080.00),
    ('11111111-1111-1111-1111-111111111102', 'CIL', 'Coal India Limited (Apex HQ)', 'apex_hq', 'New Town, Kolkata', 838.00),
    ('11111111-1111-1111-1111-111111111103', 'ECL', 'Eastern Coalfields Limited', 'subsidiary', 'Sanctoria, West Bengal', 51.00),
    ('11111111-1111-1111-1111-111111111104', 'SECL', 'South Eastern Coalfields Limited', 'subsidiary', 'Bilaspur, Chhattisgarh', 197.00),
    ('11111111-1111-1111-1111-111111111105', 'BCCL', 'Bharat Coking Coal Limited', 'subsidiary', 'Dhanbad, Jharkhand', 42.00),
    ('11111111-1111-1111-1111-111111111106', 'CMPDI', 'Central Mine Planning & Design Institute', 'institute', 'Gondwana Place, Kanke Road, Ranchi', NULL)
ON CONFLICT (code) DO NOTHING;

-- 2. Mines & Collieries
INSERT INTO mines (id, organization_id, code, name, colliery_type, area_name, state)
VALUES
    ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111103', 'RAJ-OCP', 'Rajmahal Open Cast Project', 'open_cast', 'Rajmahal Area', 'Jharkhand'),
    ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111104', 'GEV-OCP', 'Gevra Mega Open Cast Project', 'open_cast', 'Gevra Area', 'Chhattisgarh'),
    ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111104', 'KUS-OCP', 'Kusmunda Open Cast Project', 'open_cast', 'Kusmunda Area', 'Chhattisgarh'),
    ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111105', 'JHA-UG', 'Jharia Deep Underground Colliery', 'underground', 'Jharia Area', 'Jharkhand')
ON CONFLICT (code) DO NOTHING;

-- 3. Four Target Prototype Personas
INSERT INTO profiles (id, auth_user_id, organization_id, mine_id, email, full_name, role, role_label, designation, is_demo)
VALUES
    (
        '33333333-3333-3333-3333-333333333301',
        NULL,
        '11111111-1111-1111-1111-111111111101',
        NULL,
        'ministry.exec@demo.coal.gov.in',
        'Dr. Rajeshwar Sharma, IAS',
        'ministry_coal',
        'Ministry Executive',
        'Joint Secretary (Coal Operations)',
        true
    ),
    (
        '33333333-3333-3333-3333-333333333302',
        NULL,
        '11111111-1111-1111-1111-111111111102',
        NULL,
        'cil.director@demo.coalindia.in',
        'Er. S. N. Bhattacharya',
        'cil_hq',
        'CIL HQ Director',
        'Chief General Manager (Production & Planning)',
        true
    ),
    (
        '33333333-3333-3333-3333-333333333303',
        NULL,
        '11111111-1111-1111-1111-111111111106',
        NULL,
        'cmpdi.nodal@demo.cmpdi.co.in',
        'Dr. Ananya Mukherjee',
        'cmpdi',
        'CMPDI Nodal Expert',
        'Nodal Technical Coordinator, Mining Systems Cell',
        true
    ),
    (
        '33333333-3333-3333-3333-333333333304',
        NULL,
        '11111111-1111-1111-1111-111111111103',
        '22222222-2222-2222-2222-222222222201',
        'ecl.officer@demo.easterncoal.gov.in',
        'Er. Amitav Ghosh',
        'subsidiary_officer',
        'Colliery Project Officer',
        'Colliery Data Entry Officer, Rajmahal OCP',
        true
    )
ON CONFLICT (email) DO NOTHING;

-- 4. Sample Documents & Extracted Returns
INSERT INTO documents (
    id, organization_id, mine_id, uploaded_by, title, category, reporting_period, 
    storage_path, file_name, file_size_bytes, mime_type, sha256_hash, page_count, 
    status, overall_confidence, extracted_summary, is_demo
)
VALUES
    (
        '44444444-4444-4444-4444-444444444401',
        '11111111-1111-1111-1111-111111111103',
        '22222222-2222-2222-2222-222222222201',
        '33333333-3333-3333-3333-333333333304',
        'Rajmahal OCP Monthly Operational Return - August 2026',
        'production',
        'August 2026',
        'ECL/ECL_Rajmahal_Monthly_Aug2026.pdf',
        'ECL_Rajmahal_Monthly_Aug2026.pdf',
        2516582,
        'application/pdf',
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        2,
        'approved',
        88.50,
        'Monthly operational return covering raw coal extraction (45,210 Tonnes) and overburden removal (142,500 m³) at Rajmahal OCP for August 2026.',
        true
    ),
    (
        '44444444-4444-4444-4444-444444444402',
        '11111111-1111-1111-1111-111111111104',
        '22222222-2222-2222-2222-222222222202',
        '33333333-3333-3333-3333-333333333302',
        'Gevra Mega OCP Shovel & Heavy Machinery Report - August 2026',
        'production',
        'August 2026',
        'SECL/SECL_Gevra_Machinery_Aug2026.pdf',
        'SECL_Gevra_Machinery_Aug2026.pdf',
        3145728,
        'application/pdf',
        'c4ca4238a0b923820dcc509a6f75849b27ae41e4649b934ca495991b7852b855',
        3,
        'approved',
        93.20,
        'High-capacity excavator deployment logs and continuous dragline metrics at Gevra Project.',
        true
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Extracted Evidence Fields with Bounding Boxes
INSERT INTO extracted_records (
    id, document_id, page_number, field_name, field_label, 
    extracted_value, verified_value, unit, confidence, bounding_box, status
)
VALUES
    (
        '55555555-5555-5555-5555-555555555501',
        '44444444-4444-4444-4444-444444444401',
        1,
        'raw_coal_production',
        'Raw Coal Production',
        '45,210',
        '45210',
        'Tonnes',
        92.00,
        '{"ymin": 0.245, "xmin": 0.120, "ymax": 0.280, "xmax": 0.350}',
        'verified'
    ),
    (
        '55555555-5555-5555-5555-555555555502',
        '44444444-4444-4444-4444-444444444401',
        1,
        'ob_removal',
        'Overburden Removal',
        '142,500',
        '142500',
        'm³',
        88.00,
        '{"ymin": 0.295, "xmin": 0.120, "ymax": 0.330, "xmax": 0.350}',
        'verified'
    ),
    (
        '55555555-5555-5555-5555-555555555503',
        '44444444-4444-4444-4444-444444444401',
        1,
        'despatch_rakes',
        'Rail Rakes Despatched',
        '28',
        '28',
        'Rakes',
        96.00,
        '{"ymin": 0.345, "xmin": 0.120, "ymax": 0.380, "xmax": 0.350}',
        'verified'
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Production Ground Truth
INSERT INTO production_records (
    id, organization_id, mine_id, source_type, source_document_id, reporting_period, 
    record_date, raw_coal_tonnes, overburden_m3, despatch_rakes, ash_percentage, approval_status
)
VALUES
    (
        '66666666-6666-6666-6666-666666666601',
        '11111111-1111-1111-1111-111111111103',
        '22222222-2222-2222-2222-222222222201',
        'document_extraction',
        '44444444-4444-4444-4444-444444444401',
        'August 2026',
        '2026-08-31',
        45210.00,
        142500.00,
        28,
        34.50,
        'approved'
    ),
    (
        '66666666-6666-6666-6666-666666666602',
        '11111111-1111-1111-1111-111111111104',
        '22222222-2222-2222-2222-222222222202',
        'document_extraction',
        '44444444-4444-4444-4444-444444444402',
        'August 2026',
        '2026-08-31',
        389500.00,
        920000.00,
        142,
        38.20,
        'approved'
    )
ON CONFLICT (id) DO NOTHING;

-- 7. External Statutory Portals Catalog
INSERT INTO data_sources (id, code, name, source_url, classification, check_schedule, freshness_status)
VALUES
    (
        '77777777-7777-7777-7777-777777777701',
        'CCO_MONTHLY',
        'Coal Controller Organisation Monthly Coal Statistics',
        'https://coalcontroller.gov.in/monthly-statistics',
        'public_accessible',
        'monthly',
        'fresh'
    ),
    (
        '77777777-7777-7777-7777-777777777702',
        'MOC_CABINET',
        'Ministry of Coal Monthly Summary for Cabinet',
        'https://coal.gov.in/monthly-summary-cabinet',
        'public_accessible',
        'monthly',
        'fresh'
    ),
    (
        '77777777-7777-7777-7777-777777777703',
        'CIL_OFFTAKE',
        'Coal India Limited Provisional Production & Offtake',
        'https://coalindia.in/performance/provisional-production',
        'public_accessible',
        'monthly',
        'fresh'
    )
ON CONFLICT (code) DO NOTHING;
