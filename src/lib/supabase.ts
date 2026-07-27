import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  account_type: "individual" | "company";
  industry: string | null;
  created_at: string;
};

export type Regulation = {
  id: string;
  title: string;
  country: string;
  industry: string;
  category: string;
  document_name: string;
  section_number: string | null;
  page_number: number | null;
  line_number: number | null;
  content: string;
  summary: string | null;
  effective_date: string | null;
};

export type ChatSession = {
  id: string;
  user_id: string;
  title: string | null;
  industry: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  references: RegulationRef[] | null;
  created_at: string;
};

export type RegulationRef = {
  doc_name: string;
  section: string;
  page: number;
  line: number | null;
  country: string;
  industry: string;
};

export type ComplianceReport = {
  id: string;
  user_id: string;
  title: string;
  industry: string;
  country: string;
  company_name: string | null;
  report_data: ReportData;
  pdf_path: string | null;
  status: "draft" | "generated" | "downloaded";
  created_at: string;
};

export type ReportData = {
  summary: string;
  industry: string;
  country: string;
  company_name: string;
  sections: ReportSection[];
  generated_at: string;
};

export type ReportSection = {
  category: string;
  regulations: {
    title: string;
    reference: string;
    requirement: string;
    status: "compliant" | "non-compliant" | "review-needed";
  }[];
};
