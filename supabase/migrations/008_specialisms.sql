CREATE TABLE public.specialism_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector text NOT NULL,
  specialism_name text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.recruiter_specialisms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_profile_id uuid NOT NULL REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,
  specialism_category_id uuid NOT NULL REFERENCES public.specialism_categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(recruiter_profile_id, specialism_category_id)
);

GRANT SELECT ON public.specialism_categories TO authenticated, anon;
GRANT SELECT, INSERT, DELETE ON public.recruiter_specialisms TO authenticated;

ALTER TABLE public.specialism_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_specialisms ENABLE ROW LEVEL SECURITY;

CREATE POLICY specialism_categories_select ON public.specialism_categories
  FOR SELECT USING (true);

CREATE POLICY recruiter_specialisms_select ON public.recruiter_specialisms
  FOR SELECT USING (true);

CREATE POLICY recruiter_specialisms_insert ON public.recruiter_specialisms
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.recruiter_profiles WHERE id = recruiter_profile_id
    )
  );

CREATE POLICY recruiter_specialisms_delete ON public.recruiter_specialisms
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM public.recruiter_profiles WHERE id = recruiter_profile_id
    )
  );

INSERT INTO public.specialism_categories (sector, specialism_name, display_order) VALUES
  -- Technology
  ('Technology', 'Software Engineering', 1),
  ('Technology', 'Data and Analytics', 2),
  ('Technology', 'DevOps and Cloud', 3),
  ('Technology', 'Cybersecurity', 4),
  ('Technology', 'Product Management', 5),
  ('Technology', 'UX and Design', 6),
  ('Technology', 'QA and Testing', 7),
  ('Technology', 'Architecture', 8),
  ('Technology', 'Mobile Development', 9),
  ('Technology', 'AI and Machine Learning', 10),
  ('Technology', 'ERP and Enterprise Systems', 11),
  -- Finance and Financial Services
  ('Finance and Financial Services', 'Investment Banking', 1),
  ('Finance and Financial Services', 'Asset Management', 2),
  ('Finance and Financial Services', 'Private Equity', 3),
  ('Finance and Financial Services', 'Risk and Compliance', 4),
  ('Finance and Financial Services', 'Financial Planning and Analysis', 5),
  ('Finance and Financial Services', 'Treasury', 6),
  ('Finance and Financial Services', 'Audit and Assurance', 7),
  ('Finance and Financial Services', 'Insurance', 8),
  ('Finance and Financial Services', 'Fintech', 9),
  ('Finance and Financial Services', 'Actuarial', 10),
  ('Finance and Financial Services', 'Credit and Lending', 11),
  -- Sales and Commercial
  ('Sales and Commercial', 'B2B Sales', 1),
  ('Sales and Commercial', 'Enterprise Sales', 2),
  ('Sales and Commercial', 'SaaS Sales', 3),
  ('Sales and Commercial', 'Business Development', 4),
  ('Sales and Commercial', 'Account Management', 5),
  ('Sales and Commercial', 'Sales Leadership', 6),
  ('Sales and Commercial', 'Channel and Partnerships', 7),
  ('Sales and Commercial', 'Revenue Operations', 8),
  -- Marketing
  ('Marketing', 'Digital Marketing', 1),
  ('Marketing', 'Brand and Communications', 2),
  ('Marketing', 'Content and SEO', 3),
  ('Marketing', 'Performance Marketing', 4),
  ('Marketing', 'Product Marketing', 5),
  ('Marketing', 'CRM and Lifecycle', 6),
  ('Marketing', 'Events', 7),
  ('Marketing', 'PR and Media', 8),
  -- Human Resources
  ('Human Resources', 'Talent Acquisition', 1),
  ('Human Resources', 'HR Business Partnering', 2),
  ('Human Resources', 'Learning and Development', 3),
  ('Human Resources', 'Compensation and Benefits', 4),
  ('Human Resources', 'HR Operations', 5),
  ('Human Resources', 'People Analytics', 6),
  ('Human Resources', 'Organisational Development', 7),
  -- Legal
  ('Legal', 'Corporate Law', 1),
  ('Legal', 'Employment Law', 2),
  ('Legal', 'Compliance and Regulatory', 3),
  ('Legal', 'In-house Counsel', 4),
  ('Legal', 'Intellectual Property', 5),
  ('Legal', 'Commercial Contracts', 6),
  ('Legal', 'Financial Services Legal', 7),
  -- Life Sciences and Pharma
  ('Life Sciences and Pharma', 'Clinical Research', 1),
  ('Life Sciences and Pharma', 'Regulatory Affairs', 2),
  ('Life Sciences and Pharma', 'Medical Affairs', 3),
  ('Life Sciences and Pharma', 'Quality Assurance', 4),
  ('Life Sciences and Pharma', 'Pharmacovigilance', 5),
  ('Life Sciences and Pharma', 'Biotech', 6),
  ('Life Sciences and Pharma', 'Medical Devices', 7),
  ('Life Sciences and Pharma', 'Healthcare IT', 8),
  -- Engineering and Manufacturing
  ('Engineering and Manufacturing', 'Mechanical Engineering', 1),
  ('Engineering and Manufacturing', 'Electrical Engineering', 2),
  ('Engineering and Manufacturing', 'Civil and Structural', 3),
  ('Engineering and Manufacturing', 'Process Engineering', 4),
  ('Engineering and Manufacturing', 'Lean and Continuous Improvement', 5),
  ('Engineering and Manufacturing', 'Project Engineering', 6),
  ('Engineering and Manufacturing', 'Maintenance and Reliability', 7),
  -- Supply Chain and Logistics
  ('Supply Chain and Logistics', 'Procurement', 1),
  ('Supply Chain and Logistics', 'Supply Chain Management', 2),
  ('Supply Chain and Logistics', 'Logistics and Distribution', 3),
  ('Supply Chain and Logistics', 'Warehouse Operations', 4),
  ('Supply Chain and Logistics', 'Planning and Forecasting', 5),
  ('Supply Chain and Logistics', 'Transport Management', 6),
  ('Supply Chain and Logistics', 'Import and Export', 7),
  -- Accounting
  ('Accounting', 'Practice Accounting', 1),
  ('Accounting', 'Commercial Finance', 2),
  ('Accounting', 'Management Accounting', 3),
  ('Accounting', 'Financial Reporting', 4),
  ('Accounting', 'Tax', 5),
  ('Accounting', 'Payroll', 6),
  ('Accounting', 'Bookkeeping', 7),
  ('Accounting', 'CFO and Finance Leadership', 8),
  -- Construction and Property
  ('Construction and Property', 'Quantity Surveying', 1),
  ('Construction and Property', 'Project Management', 2),
  ('Construction and Property', 'Site Management', 3),
  ('Construction and Property', 'Architecture and Design', 4),
  ('Construction and Property', 'Facilities Management', 5),
  ('Construction and Property', 'Property Development', 6),
  ('Construction and Property', 'Health and Safety', 7),
  -- Executive and Leadership
  ('Executive and Leadership', 'C-Suite', 1),
  ('Executive and Leadership', 'Board Level', 2),
  ('Executive and Leadership', 'General Management', 3),
  ('Executive and Leadership', 'Country and Regional Leadership', 4),
  ('Executive and Leadership', 'Non-Executive Director', 5),
  ('Executive and Leadership', 'Interim Management', 6),
  -- Operations and Business Support
  ('Operations and Business Support', 'Operations Management', 1),
  ('Operations and Business Support', 'Business Analysis', 2),
  ('Operations and Business Support', 'Project and Programme Management', 3),
  ('Operations and Business Support', 'Change Management', 4),
  ('Operations and Business Support', 'Customer Success', 5),
  ('Operations and Business Support', 'Administration and EA', 6);
