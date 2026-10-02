export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
  is_active?: boolean;
  auth_provider?: string;
}

export interface WorkExperience {
  id: string;
  company_name: string;
  title: string;
  location: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string;
  technologies_json: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  url?: string;
  technologies_json: string[];
}

export interface Education {
  id: string;
  institution_name: string;
  degree: string;
  field_of_study: string;
  start_year: number;
  end_year?: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  credential_url?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  headline: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  years_of_experience: number;
  profile_confidence: number;
  target_role?: string;
  summary_json?: {
    verified_skills?: number;
    top_domains?: string[];
    readiness_percentage?: number;
    [key: string]: any;
  };
  experiences: WorkExperience[];
  projects?: Project[];
  education?: Education[];
  certifications?: Certification[];
}

export interface CareerGoal {
  id?: string;
  target_role: string;
  target_seniority?: string;
  target_locations?: string[];
  target_salary_min?: number;
  target_salary_range?: string;
  workplace_preference?: "REMOTE" | "HYBRID" | "ONSITE" | string;
  created_at?: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  description: string;
  source_type: string;
  url?: string;
  created_at?: string;
}

export interface SkillEvidenceItem {
  id: string;
  skill_name: string;
  category: string;
  strength: "STRONG" | "MODERATE" | "DEVELOPING" | string;
  proficiency_estimate: number;
  confidence_rating?: "HIGH" | "MEDIUM" | "LOW" | string;
  verified_at?: string;
  evidence_items: EvidenceItem[];
}

export interface SourceItem {
  id: string;
  source_type: "github" | "linkedin" | "resume" | "portfolio" | string;
  display_name: string;
  source_url?: string;
  status: "CONNECTED" | "SYNCING" | "PENDING" | "ERROR" | string;
  last_synced_at?: string;
  items_ingested_count?: number;
  error_message?: string;
}

export interface GapItem {
  id: string;
  title?: string;
  skill_name?: string;
  target_role?: string;
  gap_type?: "SKILL_GAP" | "EVIDENCE_GAP" | "EXPERIENCE_GAP" | string;
  priority?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  current_level?: number;
  target_level?: number;
  priority_score?: number;
  job_count_affected?: number;
  expected_impact?: string;
  estimated_effort_hours?: number;
  estimated_hours_to_close?: number;
  description?: string;
  rationale?: string;
  recommended_action?: string;
  action_plan_summary?: string;
  created_at?: string;
  [key: string]: any;
}

export interface LearningPlanItemType {
  id: string;
  title: string;
  item_type?: "READ" | "PRACTICE" | "BUILD" | "PROVE" | string;
  duration_minutes?: number;
  is_completed?: boolean;
  resource_url?: string;
  [key: string]: any;
}

export interface LearningPlanType {
  id: string;
  title: string;
  target_skill?: string;
  progress_percentage?: number;
  estimated_duration_days?: number;
  status?: string;
  items: LearningPlanItemType[];
  [key: string]: any;
}

export interface ResourceItem {
  id: string;
  title: string;
  url?: string;
  external_url?: string;
  resource_type?: string;
  provider?: string;
  cost?: string;
  duration_minutes?: number;
  difficulty?: string;
  why_chosen?: string;
  what_you_will_learn?: string[];
  [key: string]: any;
}

export type MatchItem = MatchResult;

// ==============================================================================
// Living Professional Portfolio Types
// ==============================================================================

export interface CapabilityRating {
  score: number;
  label: string; // "Advanced", "Expert", "Strong", "Developing"
}

export interface ConfidenceBreakdown {
  score: number;
  label: string; // "High confidence", "Medium confidence"
  verified_sources_count: number;
  unverified_claims_count: number;
}

export interface PortfolioHero {
  full_name: string;
  headline: string;
  primary_domains: string[];
  seniority_level: string;
  location: string;
  profile_completeness_pct: number;
  confidence: ConfidenceBreakdown;
  ai_summary: string;
}

export interface PortfolioAbout {
  how_jobpilot_sees_you: string;
  career_narrative: string;
  ideal_next_role: string;
  target_salary_range: string;
  workplace_preference: string;
}

export interface PortfolioExperienceItem {
  company: string;
  title: string;
  period: string;
  location: string;
  impact_bullets: string[];
  verified_evidence_badges: string[];
  skills_used: string[];
}

export interface PortfolioProjectItem {
  name: string;
  type: string;
  description: string;
  architecture_summary: string;
  verified_evidence_badge: string;
  metrics: string;
  github_url?: string;
  live_url?: string;
  tags: string[];
}

export interface CategorizedSkillItem {
  name: string;
  category: string;
  capability: CapabilityRating;
  confidence: ConfidenceBreakdown;
  target_demand_pct: number;
  status: "VERIFIED" | "NEEDS_EVIDENCE" | "IN_PROGRESS";
  evidence_count: number;
  why_it_matters: string;
  target_roles_requiring_count: number;
}

export interface ConnectedSourceItem {
  name: string;
  type: string;
  icon: string;
  status: "CONNECTED" | "SYNCING" | "PENDING";
  item_count_label: string;
  last_synced: string;
}

export interface LivingPortfolioResponse {
  hero: PortfolioHero;
  about: PortfolioAbout;
  experiences: PortfolioExperienceItem[];
  projects: PortfolioProjectItem[];
  skills?: CategorizedSkillItem[];
  categorized_skills?: any;
  connected_sources: ConnectedSourceItem[];
  [key: string]: any;
}

// ==============================================================================
// Matching & Opportunities
// ==============================================================================

export interface JobCompany {
  id?: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  industry?: string;
  [key: string]: any;
}

export interface JobRequirement {
  id?: string;
  name: string;
  requirement_type?: string;
  is_required?: boolean;
  importance?: number;
  target_level?: number;
  status?: "MATCHED" | "GAP" | "DEVELOPING";
}

export interface Job {
  id: string;
  title: string;
  company_id?: string;
  location: string;
  employment_type?: string;
  salary_min?: number;
  salary_max?: number;
  is_remote?: boolean;
  seniority?: string;
  description_raw?: string;
  required_skills_json?: string[];
  responsibilities_json?: string[];
  company: JobCompany;
  requirements?: JobRequirement[];
  [key: string]: any;
}

export interface MatchResult {
  id: string;
  job_id?: string;
  job: Job;
  overall_score: number;
  technical_fit: number;
  experience_fit: number;
  preference_fit: number;
  location_fit?: number;
  seniority_fit?: number;
  evidence_confidence?: number;
  recommendation_category?: string;
  explanation: string;
  why_matched?: string;
  matched_skills_json: string[];
  missing_skills_json: string[];
  calculated_at?: string;
  actionable_gaps?: { skill_name: string; priority: string; action_url: string }[];
  [key: string]: any;
}

// ==============================================================================
// Daily Plan & Kanban Tasks (Improve)
// ==============================================================================

export interface LearningResourceCard {
  title: string;
  resource_type: string;
  cost: string;
  duration_minutes: number;
  why_chosen: string;
  what_you_will_learn: string[];
  url: string;
}

export interface LearningTask {
  id: string;
  user_id: string;
  source_gap_id?: string;
  learning_plan_id?: string;
  title: string;
  description: string;
  estimated_minutes: number;
  scheduled_day: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  status: "BACKLOG" | "TODAY" | "IN_PROGRESS" | "DONE" | "READY_TO_PROVE";
  task_type: "READ" | "WATCH" | "PRACTICE" | "BUILD" | "REVIEW" | "TEST";
  order: number;
  resource?: LearningResourceCard;
}

export interface DailyPlan {
  today_focus_skill: string;
  current_level: number;
  target_level: number;
  target_role_impact: string;
  tasks_completed_count: number;
  total_tasks_count: number;
  concepts_practiced_count: number;
  total_concepts_count: number;
  proof_completed_count: number;
  total_proof_count: number;
  today_tasks: LearningTask[];
  kanban_columns: {
    BACKLOG: LearningTask[];
    TODAY: LearningTask[];
    IN_PROGRESS: LearningTask[];
    DONE: LearningTask[];
    READY_TO_PROVE: LearningTask[];
  };
}

export interface CustomSkillAnalysis {
  skill_name: string;
  relevance_score: number;
  target_opportunities_unlocked: number;
  estimated_effort_hours: number;
  diagnostic_gap: string;
  recommended_plan_id: string;
  initial_tasks: LearningTask[];
}

// ==============================================================================
// Assessment & Proving Environment
// ==============================================================================

export interface AssessmentQuestion {
  id: string;
  order_index?: number;
  prompt: string;
  question_type?: string;
  options_json?: string[];
  points?: number;
  starter_code?: string;
  [key: string]: any;
}

export interface AssessmentType {
  id: string;
  skill_id?: string;
  title: string;
  assessment_type?: string;
  time_limit_minutes: number;
  passing_score: number;
  difficulty?: string;
  description?: string;
  skills_evaluated?: string[];
  required_permissions?: string[];
  questions?: AssessmentQuestion[];
  created_at?: string;
  [key: string]: any;
}

export interface AssessmentSession {
  session_id: string;
  assessment_id: string;
  assessment?: AssessmentType;
  started_at?: string;
  expires_at?: string;
  status?: string;
  integrity_status?: "NORMAL" | "REVIEW_RECOMMENDED" | string;
  [key: string]: any;
}

export interface AssessmentEvaluationItem {
  question_id: string;
  user_answer?: string;
  correct_answer?: string;
  is_correct: boolean;
  explanation?: string;
  [key: string]: any;
}

export interface AssessmentAttemptResult {
  id: string;
  assessment_id?: string;
  score?: number;
  passed?: boolean;
  score_percentage?: number;
  skill_proficiency_boost?: number;
  skill_level_before?: number;
  skill_level_after?: number;
  recalculated_matches_notice?: string;
  feedback_summary?: string;
  breakdown?: Record<string, number>;
  evaluations?: AssessmentEvaluationItem[];
  created_at?: string;
  [key: string]: any;
}

// ==============================================================================
// Applications & Resume Center & Automation Queue
// ==============================================================================

export interface ResumeVersion {
  id: string;
  name: string;
  target_role: string;
  version_type: "MASTER" | "TAILORED";
  summary: string;
  emphasized_skills: string[];
  reduced_skills: string[];
  change_rationale: string;
  truthfulness_verified: boolean;
  updated_at: string;
}

export interface AutoApplyExecutionItem {
  id: string;
  company_name: string;
  role_title: string;
  match_score: number;
  status: "QUEUED" | "PROCESSING" | "SUBMITTED" | "NEEDS_REVIEW" | "FAILED";
  failure_reason?: string;
  can_fix: boolean;
  timestamp: string;
}

export interface AutoApplyExecutionResponse {
  queued_count: number;
  processing_count: number;
  submitted_count: number;
  needs_review_count: number;
  failed_count: number;
  executions: AutoApplyExecutionItem[];
}

export interface AutoApplyPreviewResponse {
  eligible_opportunities_count: number;
  meets_rules_count: number;
  needs_review_count: number;
  blocked_count: number;
  applied_today_count: number;
  daily_limit: number;
  min_match_score: number;
  eligible_jobs: { id: string; title: string; company: string; score: number; status: string }[];
}

export interface ApplicationArtifact {
  id: string;
  artifact_type: string;
  title: string;
  content_text: string;
  provenance_sources_json: string[];
  metadata_json?: Record<string, any>;
}

export interface ApplicationItem {
  id: string;
  status: "DRAFT" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED" | string;
  created_at: string;
  tailored_role_title?: string;
  match_score_at_application: number;
  notes?: string;
  job: Job;
  artifacts: ApplicationArtifact[];
}

export interface ApplicationPolicyType {
  id?: string;
  mode?: "MANUAL" | "ASSISTED" | "AUTONOMOUS" | string;
  is_auto_apply_enabled?: boolean;
  is_enabled?: boolean;
  min_match_score?: number;
  daily_application_limit?: number;
  requires_user_approval?: boolean;
  require_user_review?: boolean;
  auto_tailor_resume?: boolean;
  auto_generate_cover_letter?: boolean;
  require_review_for_senior_roles?: boolean;
  salary_floor?: number;
  prohibited_keywords?: string[];
  restricted_companies?: string[];
  target_locations?: string[];
  eligible_count?: number;
}

// ==============================================================================
// Outcomes & Funnel Analytics
// ==============================================================================

export interface FunnelStage {
  stage: string;
  count: number;
  conversion_rate_percentage: number;
}

export interface BottleneckDiagnostic {
  primary_bottleneck_stage: string;
  bottleneck_reason: string;
  actionable_recommendation: string;
  impact_score: number;
}

export interface FunnelAnalytics {
  total_applications: number;
  applied: number;
  interviews: number;
  offers: number;
  stages: FunnelStage[];
  primary_bottleneck?: string;
  strategic_recommendation?: string;
  bottleneck_summary?: BottleneckDiagnostic;
  recent_events?: any[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url: string;
  type: "match" | "assessment" | "source" | "application" | "system";
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon_type: string;
  stage: string;
  action_url?: string;
}
