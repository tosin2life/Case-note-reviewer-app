/**
 * Medical Case Analysis Prompts for Google Gemini AI
 * These prompts guide the AI to analyze medical case notes across 4 criteria
 */

export interface AnalysisCriteria {
  historyPhysical: number
  differential: number
  assessmentPlan: number
  followup: number
}

export interface AnalysisFeedback {
  historyPhysical: string
  differential: string
  assessmentPlan: string
  followup: string
}

export interface AnalysisResult {
  historyPhysical: { score: number; feedback: string }
  differential: { score: number; feedback: string }
  assessmentPlan: { score: number; feedback: string }
  followup: { score: number; feedback: string }
  totalScore: number
  overallFeedback: string
}

// Base prompt template for medical case analysis (from PRD)
export const MEDICAL_ANALYSIS_SYSTEM_PROMPT = `You are an expert medical educator tasked with evaluating clinical case documentation.
Analyze the provided clinical case text and score it based on these 4 criteria:

1. HISTORY & PHYSICAL EXAM (1-3 points):
   - 3 points: Well-organized, accurate, relevant to complaint
   - 2 points: Minor details missing but adequate for assessment
   - 1 point: Key diagnostic information missing

2. DIFFERENTIAL DIAGNOSIS (1-3 points):
   - 3 points: Well-developed, prioritized, clinically reasoned
   - 2 points: Lacks depth but includes main diagnoses
   - 1 point: Incomplete or incorrect differential

3. ASSESSMENT & TREATMENT PLAN (1-3 points):
   - 3 points: Evidence-based, appropriate, comprehensive
   - 2 points: Addresses chief complaint adequately
   - 1 point: Inappropriate or incomplete plan

4. FOLLOW-UP (1-3 points):
   - 3 points: Appropriate follow-up documented and scheduled
   - 2 points: Follow-up documented but not scheduled
   - 1 point: No appropriate follow-up documented

Return ONLY valid JSON in this exact format:
{
  "historyPhysical": {"score": X, "feedback": "specific feedback"},
  "differential": {"score": X, "feedback": "specific feedback"},
  "assessmentPlan": {"score": X, "feedback": "specific feedback"},
  "followup": {"score": X, "feedback": "specific feedback"},
  "totalScore": X,
  "overallFeedback": "comprehensive summary"
}`

// Prompt for History & Physical Examination analysis
export const HISTORY_PHYSICAL_PROMPT = (caseNote: string) => `
Analyze the History & Physical Examination section of this medical case note:

**Case Note:**
${caseNote}

**Instructions:**
Evaluate the quality and completeness of:
- Patient history taking (chief complaint, history of present illness, past medical history, medications, allergies, social history, family history, review of systems)
- Physical examination documentation (vital signs, systematic examination findings, relevant clinical signs)
- Documentation quality and organization

**Scoring Criteria (from PRD):**
- 3 points: Well-organized, accurate, relevant to complaint
- 2 points: Minor details missing but adequate for assessment
- 1 point: Key diagnostic information missing

**Response Format (JSON only):**
{
  "score": [1-3],
  "feedback": "Specific feedback on strengths and areas for improvement",
  "strengths": ["List of strong points"],
  "improvements": ["List of specific areas to improve"],
  "evidence": "Clinical evidence supporting the assessment"
}`

// Prompt for Differential Diagnosis analysis
export const DIFFERENTIAL_DIAGNOSIS_PROMPT = (caseNote: string) => `
Analyze the Differential Diagnosis section of this medical case note:

**Case Note:**
${caseNote}

**Instructions:**
Evaluate the appropriateness and thoroughness of:
- Differential diagnoses considered
- Clinical reasoning and diagnostic process
- Use of evidence-based diagnostic criteria
- Consideration of red flags and serious conditions
- Appropriate use of diagnostic tests

**Scoring Criteria (from PRD):**
- 3 points: Well-developed, prioritized, clinically reasoned
- 2 points: Lacks depth but includes main diagnoses
- 1 point: Incomplete or incorrect differential

**Response Format (JSON only):**
{
  "score": [1-3],
  "feedback": "Specific feedback on diagnostic reasoning quality",
  "strengths": ["List of strong diagnostic reasoning points"],
  "improvements": ["List of specific diagnostic areas to improve"],
  "evidence": "Clinical evidence supporting the assessment"
}`

// Prompt for Assessment & Treatment analysis
export const ASSESSMENT_TREATMENT_PROMPT = (caseNote: string) => `
Analyze the Assessment & Treatment section of this medical case note:

**Case Note:**
${caseNote}

**Instructions:**
Evaluate the quality of:
- Clinical assessment and diagnostic conclusions
- Treatment plan appropriateness and evidence base
- Medication selection and dosing
- Non-pharmacological interventions
- Patient education and counseling
- Risk-benefit analysis

**Scoring Criteria (from PRD):**
- 3 points: Evidence-based, appropriate, comprehensive
- 2 points: Addresses chief complaint adequately
- 1 point: Inappropriate or incomplete plan

**Response Format (JSON only):**
{
  "score": [1-3],
  "feedback": "Specific feedback on assessment and treatment quality",
  "strengths": ["List of strong treatment planning points"],
  "improvements": ["List of specific treatment areas to improve"],
  "evidence": "Clinical evidence supporting the assessment"
}`

// Prompt for Follow-up analysis
export const FOLLOW_UP_PROMPT = (caseNote: string) => `
Analyze the Follow-up section of this medical case note:

**Case Note:**
${caseNote}

**Instructions:**
Evaluate the adequacy of:
- Follow-up scheduling and timing
- Monitoring parameters and indicators
- Patient instructions and education
- Warning signs and when to return
- Continuity of care planning
- Documentation of follow-up plan

**Scoring Criteria (from PRD):**
- 3 points: Appropriate follow-up documented and scheduled
- 2 points: Follow-up documented but not scheduled
- 1 point: No appropriate follow-up documented

**Response Format (JSON only):**
{
  "score": [1-3],
  "feedback": "Specific feedback on follow-up planning quality",
  "strengths": ["List of strong follow-up planning points"],
  "improvements": ["List of specific follow-up areas to improve"],
  "evidence": "Clinical evidence supporting the assessment"
}`

// Combined analysis prompt for all criteria (from PRD)
export const COMPREHENSIVE_ANALYSIS_PROMPT = (caseNote: string) => `
${MEDICAL_ANALYSIS_SYSTEM_PROMPT}

Clinical case to analyze:
${caseNote}`

// Sample medical case notes for testing
export const SAMPLE_CASE_NOTES = {
  good: `**Chief Complaint:** 45-year-old male presents with chest pain

**History of Present Illness:** 
Patient reports 3-day history of substernal chest pressure, rated 7/10, radiating to left arm. Pain is worse with exertion and relieved with rest. No associated nausea, vomiting, or diaphoresis. Denies shortness of breath at rest.

**Past Medical History:** Hypertension, hyperlipidemia, smoking 1 pack/day x 20 years

**Medications:** Lisinopril 10mg daily, Atorvastatin 20mg daily

**Physical Examination:**
Vital signs: BP 150/90, HR 88, RR 16, O2 sat 98% RA
Cardiovascular: Regular rate and rhythm, no murmurs
Pulmonary: Clear to auscultation bilaterally
Extremities: No edema

**Assessment and Plan:**
1. Chest pain - likely musculoskeletal vs cardiac etiology
   - EKG, troponins, CXR ordered
   - Cardiology consultation if cardiac markers positive
   - Patient counseled on smoking cessation

**Follow-up:** Return if symptoms worsen, cardiology follow-up pending lab results`,

  poor: `**Chief Complaint:** Patient has pain

**History:** Pain in chest for few days

**Exam:** Patient looks okay

**Plan:** Give pain medicine

**Follow-up:** Come back if needed`,
}
