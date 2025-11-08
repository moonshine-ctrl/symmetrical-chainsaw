-- 🚀 Leave Management System - Database Schema untuk Supabase
-- Copy dan jalankan SQL ini di Supabase Dashboard > SQL Editor

-- ================================
-- 1. TABEL USERS
-- ================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL, -- Untuk kompatibilitas dengan kode existing
  name VARCHAR(255) NOT NULL,
  nip VARCHAR(255) UNIQUE NOT NULL,
  avatar TEXT,
  department_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Employee')),
  annual_leave_balance INTEGER DEFAULT 0,
  qr_code_signature TEXT,
  phone VARCHAR(50),
  bangsa VARCHAR(50), -- Perbaikan typo: russe -> bangsa
  join_date TIMESTAMP WITH TIME ZONE,
  address TEXT,
  password VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_nip ON users(nip);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_user_id ON users(user_id);

-- Create updated_at trigger
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 2. TABEL DEPARTMENTS
-- ================================

CREATE TABLE departments (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  employee_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 3. TABEL LEAVE TYPES
-- ================================

CREATE TABLE leave_types (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_leave_types_updated_at 
    BEFORE UPDATE ON leave_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 4. TABEL SETTINGS (LOGO & APP CONFIG)
-- ================================

CREATE TABLE app_settings (
  id VARCHAR(255) PRIMARY KEY DEFAULT 'global',
  logo_url TEXT,
  company_name VARCHAR(255),
  letterhead TEXT[],
  sick_leave_form_url TEXT,
  contact_info JSONB,
  theme_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_app_settings_updated_at 
    BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 5. TABEL LEAVE REQUESTS
-- ================================

CREATE TABLE leave_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id VARCHAR(255) UNIQUE NOT NULL, -- Untuk kompatibilitas dengan kode existing
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leave_type_id VARCHAR(255) NOT NULL REFERENCES leave_types(id),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled', 'Suspended')),
  attachment VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_approver_id UUID REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_created ON leave_requests(created_at);
CREATE INDEX idx_leave_requests_next_approver ON leave_requests(next_approver_id);
CREATE INDEX idx_leave_requests_request_id ON leave_requests(request_id);

CREATE TRIGGER update_leave_requests_updated_at 
    BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 6. TABEL NOTIFICATIONS
-- ================================

CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'success')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  leave_request_id UUID REFERENCES leave_requests(id)
);

-- Create indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ================================
-- 7. TABEL LOG ENTRIES
-- ================================

CREATE TABLE log_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  activity TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_log_entries_date ON log_entries(date);
CREATE INDEX idx_log_entries_user_name ON log_entries(user_name);
CREATE INDEX idx_log_entries_created ON log_entries(created_at);

-- ================================
-- 8. SAMPLE DATA INSERTION
-- ================================

-- Insert departments
INSERT INTO departments (id, name, employee_count) VALUES
('hr', 'Human Resources', 3),
('it', 'Information Technology', 2),
('finance', 'Finance', 2),
('marketing', 'Marketing', 2);

-- Insert leave types
INSERT INTO leave_types (id, name) VALUES
('annual', 'Cuti Tahunan'),
('sick', 'Cuti Sakit'),
('big', 'Cuti Besar'),
('maternity', 'Cuti Melahirkan'),
('important', 'Cuti Alasan Penting'),
('unpaid', 'Cuti di Luar Tanggungan Negara'),
('other', 'Cuti Lainnya');

-- Insert app settings (logo, company info, etc.)
INSERT INTO app_settings (id, logo_url, company_name, letterhead, sick_leave_form_url, contact_info, theme_config) VALUES
('global', 
 '/logo.png',
 'Pengadilan Agama Solok',
 ARRAY['MAHKAMAH AGUNG REPUBLIK INDONESIA', 'DIREKTORAT JENDERAL BADAN PERADILAN AGAMA', 'PENGADILAN TINGGI AGAMA PADANG', 'PENGADILAN AGAMA SOLOK'],
 'https://docs.google.com/forms/d/e/1FAIpQLSc_b_a-M9bA9gQlLd6v_iJbA4J/viewform',
 '{"phone": "0755-21050", "email": "pa.solok@badilag.mahkamahagung.go.id", "address": "Jln. Jend. Sudirman No. 10, Solok, Sumatra Barat 27311", "website": "pa-solok.mahkamahagung.go.id"}',
 '{"primaryColor": "#1e40af", "secondaryColor": "#64748b", "accentColor": "#0f172a", "logoWidth": 120, "headerBg": "#ffffff", "footerBg": "#f8fafc"}'
);

-- Insert sample users (tanpa foreign key constraint dulu karena users belum ada)
INSERT INTO users (user_id, name, nip, avatar, department_id, role, annual_leave_balance, phone, bangsa, join_date, qr_code_signature, password) VALUES
('1', 'Budi Santoso', '199508172021011001', 'https://picsum.photos/seed/1/100/100', 'hr', 'Employee', 12, '6281234567890', 'III/a', '2021-01-15'::timestamp, '/qr-code-placeholder.png', 'password123'),
('2', 'Citra Lestari', '199205202019032002', 'https://picsum.photos/seed/2/100/100', 'it', 'Employee', 10, '6281234567891', 'III/d', '2019-03-01'::timestamp, '/qr-code-placeholder.png', 'password123'),
('3', 'Doni Firmansyah', '199811102022021003', 'https://picsum.photos/seed/3/100/100', 'finance', 'Employee', 5, '6281234567892', 'II/c', '2022-02-01'::timestamp, '/qr-code-placeholder.png', 'password123'),
('4', 'Eka Putri', '199301152018052001', 'https://picsum.photos/seed/4/100/100', 'it', 'Employee', 12, '6281234567893', 'III/b', '2018-05-10'::timestamp, NULL, 'password123'),
('5', 'Fitriani', '199003252017062002', 'https://picsum.photos/seed/5/100/100', 'hr', 'Employee', 8, '6281234567894', 'IV/a', '2017-06-15'::timestamp, '/qr-code-placeholder.png', 'password123'),
('6', 'Gilang Ramadhan', '199609092021091004', 'https://picsum.photos/seed/6/100/100', 'marketing', 'Employee', 15, '6281234567895', 'III/a', '2021-09-10'::timestamp, NULL, 'password123'),
('7', 'Hana Yulita', '199107212018112003', 'https://picsum.photos/seed/7/100/100', 'finance', 'Employee', 9, '6281234567896', 'IV/b', '2018-11-01'::timestamp, '/qr-code-placeholder.png', 'password123'),
('8', 'Indra Wijaya', '198912302015021001', 'https://picsum.photos/seed/8/100/100', 'marketing', 'Employee', 11, '6281234567897', 'III/c', '2015-02-20'::timestamp, NULL, 'password123'),
('admin', 'Admin SiRancak', 'admin', 'https://picsum.photos/seed/admin/100/100', 'hr', 'Admin', 0, '6281200000000', 'IV/c', '2020-12-01'::timestamp, '/qr-code-placeholder.png', 'admin123');

-- Insert sample leave requests
-- Primero, mendapatkan user IDs dari database
INSERT INTO leave_requests (request_id, user_id, leave_type_id, start_date, end_date, days, reason, status, attachment, created_at, next_approver_id)
SELECT 
    'req1',
    (SELECT id FROM users WHERE user_id = '1'),
    'annual',
    (NOW() - INTERVAL '5 days'),
    (NOW() - INTERVAL '4 days'),
    2,
    'Family vacation',
    'Approved',
    NULL,
    (NOW() - INTERVAL '10 days'),
    NULL;

INSERT INTO leave_requests (request_id, user_id, leave_type_id, start_date, end_date, days, reason, status, attachment, created_at, next_approver_id)
SELECT 
    'req2',
    (SELECT id FROM users WHERE user_id = '3'),
    'sick',
    (NOW() - INTERVAL '2 days'),
    (NOW() - INTERVAL '1 day'),
    2,
    'Sakit, butuh istirahat',
    'Approved',
    NULL,
    (NOW() - INTERVAL '3 days'),
    NULL;

INSERT INTO leave_requests (request_id, user_id, leave_type_id, start_date, end_date, days, reason, status, attachment, created_at, next_approver_id)
SELECT 
    'req3',
    (SELECT id FROM users WHERE user_id = '6'),
    'annual',
    (NOW() + INTERVAL '10 days'),
    (NOW() + INTERVAL '14 days'),
    5,
    'Trip to Bali',
    'Pending',
    NULL,
    (NOW() - INTERVAL '1 day'),
    (SELECT id FROM users WHERE user_id = '8');

-- ================================
-- 9. ROW LEVEL SECURITY (RLS) SETUP
-- ================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;

-- ================================
-- 10. BASIC RLS POLICIES
-- ================================

-- Public read access untuk development (ubah untuk production)
-- Users table
CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete users" ON users FOR DELETE USING (true);

-- Departments table
CREATE POLICY "Allow public read departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Allow public insert departments" ON departments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update departments" ON departments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete departments" ON departments FOR DELETE USING (true);

-- Leave types table
CREATE POLICY "Allow public read leave_types" ON leave_types FOR SELECT USING (true);
CREATE POLICY "Allow public insert leave_types" ON leave_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update leave_types" ON leave_types FOR UPDATE USING (true);
CREATE POLICY "Allow public delete leave_types" ON leave_types FOR DELETE USING (true);

-- Leave requests table
CREATE POLICY "Allow public read leave_requests" ON leave_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert leave_requests" ON leave_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update leave_requests" ON leave_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete leave_requests" ON leave_requests FOR DELETE USING (true);

-- App settings table
CREATE POLICY "Allow public read app_settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert app_settings" ON app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update app_settings" ON app_settings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete app_settings" ON app_settings FOR DELETE USING (true);

-- Notifications table
CREATE POLICY "Allow public read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update notifications" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Allow public delete notifications" ON notifications FOR DELETE USING (true);

-- Log entries table
CREATE POLICY "Allow public read log_entries" ON log_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert log_entries" ON log_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update log_entries" ON log_entries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete log_entries" ON log_entries FOR DELETE USING (true);

-- ================================
-- 11. VERIFICATION QUERIES
-- ================================

-- Check jika semua tabel ter-create dengan benar
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'departments', 'leave_types', 'app_settings', 'leave_requests', 'notifications', 'log_entries')
ORDER BY tablename;

-- Check jika sample data ter-insert
SELECT 
    'users' as table_name, 
    COUNT(*) as record_count 
FROM users
UNION ALL
SELECT 
    'departments', 
    COUNT(*) 
FROM departments
UNION ALL
SELECT 
    'leave_types', 
    COUNT(*) 
FROM leave_types
UNION ALL
SELECT 
    'app_settings', 
    COUNT(*) 
FROM app_settings
UNION ALL
SELECT 
    'leave_requests', 
    COUNT(*) 
FROM leave_requests;

-- ================================
-- 12. SUCCESS MESSAGE
-- ================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Database schema berhasil dibuat!';
    RAISE NOTICE '📊 Tabel yang dibuat:';
    RAISE NOTICE '  - users (% records)', (SELECT COUNT(*) FROM users);
    RAISE NOTICE '  - departments (% records)', (SELECT COUNT(*) FROM departments);
    RAISE NOTICE '  - leave_types (% records)', (SELECT COUNT(*) FROM leave_types);
    RAISE NOTICE '  - app_settings (% records)', (SELECT COUNT(*) FROM app_settings);
    RAISE NOTICE '  - leave_requests (% records)', (SELECT COUNT(*) FROM leave_requests);
    RAISE NOTICE '  - notifications (0 records)';
    RAISE NOTICE '  - log_entries (0 records)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Next steps:';
    RAISE NOTICE '1. Install dependencies: npm install @supabase/supabase-js';
    RAISE NOTICE '2. Update .env.local dengan URL dan keys dari project Anda';
    RAISE NOTICE '3. Start development server: npm run dev';
    RAISE NOTICE '4. Test koneksi di: http://localhost:9002/test';
    RAISE NOTICE '5. Update komponen untuk menggunakan data-supabase.ts';
END $$;