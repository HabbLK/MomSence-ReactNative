// Talks to the same Flask API + centralized MongoDB backend as the Flutter
// app (see ppd_project/api/app.py). Prediction runs server-side here via
// POST /predict rather than on-device, to keep this app's scope focused.
export const API_BASE = 'http://31.97.114.143';

export type QuestionSchema = { key: string; label: string; options: string[] };
export type AppSchema = { age: QuestionSchema; symptoms: QuestionSchema[]; disclaimer: string };
export type RiskFactor = { factor: string; direction: string; magnitude: number };
export type RiskResult = {
  risk_probability: number;
  risk_band: string;
  top_factors: RiskFactor[];
  disclaimer: string;
};
export type AuthResult = { token: string; name: string; email: string };
export type ServerAssessment = {
  id: string;
  timestamp: string;
  risk_probability: number;
  risk_band: string;
  top_factors: RiskFactor[];
  note: string;
};
export type CommunityFactor = { factor: string; direction: string; count: number };
export type CommunityInsights = {
  total_checkins: number;
  band_distribution: Record<string, number>;
  top_factors: CommunityFactor[];
};

export class ApiError extends Error {}

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      // ignore, keep default message
    }
    throw new ApiError(msg);
  }
  return (await res.json()) as T;
}

export const Api = {
  // The /schema JSON's "age" object has no "key" field (unlike each
  // "symptoms" entry, which does) -- it must be hardcoded to 'Age' here,
  // the same way api_service.dart's AppSchema.fromJson does on the
  // Flutter side. Without this, the age answer got stored under the
  // literal key "undefined" and every submission was rejected server-side.
  fetchSchema: (): Promise<AppSchema> =>
    fetch(`${API_BASE}/schema`)
      .then(res => handle<any>(res))
      .then(raw => ({
        age: { key: 'Age', label: raw.age.label, options: raw.age.options },
        symptoms: raw.symptoms,
        disclaimer: raw.disclaimer,
      })),

  predict: (answers: Record<string, string>): Promise<RiskResult> =>
    fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    }).then(res => handle<RiskResult>(res)),

  register: (name: string, email: string, password: string): Promise<AuthResult> =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    }).then(res => handle<AuthResult>(res)),

  login: (email: string, password: string): Promise<AuthResult> =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(res => handle<AuthResult>(res)),

  logout: (token: string): Promise<void> =>
    fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: authHeaders(token) }).then(() => undefined),

  updateName: (token: string, name: string): Promise<{ name: string; email: string }> =>
    fetch(`${API_BASE}/me`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ name }),
    }).then(res => handle<{ name: string; email: string }>(res)),

  saveAssessment: (
    token: string,
    riskProbability: number,
    riskBand: string,
    topFactors: RiskFactor[],
    note = '',
  ): Promise<ServerAssessment> =>
    fetch(`${API_BASE}/assessments/save`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        risk_probability: riskProbability,
        risk_band: riskBand,
        top_factors: topFactors,
        note,
      }),
    }).then(res => handle<ServerAssessment>(res)),

  getAssessments: (token: string): Promise<ServerAssessment[]> =>
    fetch(`${API_BASE}/assessments`, { headers: authHeaders(token) }).then(res =>
      handle<ServerAssessment[]>(res),
    ),

  updateNote: (token: string, id: string, note: string): Promise<void> =>
    fetch(`${API_BASE}/assessments/${id}/note`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ note }),
    }).then(() => undefined),

  getInsights: (): Promise<CommunityInsights> =>
    fetch(`${API_BASE}/insights`).then(res => handle<CommunityInsights>(res)),
};
