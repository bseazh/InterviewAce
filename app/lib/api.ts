const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export interface BackendQuestionMeta {
  id: string
  text: string
  tags?: string[] | null
  difficulty?: string | null
  created_at?: string | null
}

export interface BackendKnowledgeItem {
  id: string
  question: BackendQuestionMeta
  flashcard: {
    answer: string
    pitfalls: string[]
  }
  mindmap: Record<string, unknown>
  code: {
    lang: string
    snippet: string
    explanation: string
  }
  project_usage?: string | null
  created_at?: string | null
  updated_at?: string | null
}

interface FetchParams {
  q?: string
  tag?: string
  difficulty?: string
  page?: number
  page_size?: number
}

interface PaginatedKnowledgeResponse {
  items: BackendKnowledgeItem[]
  total: number
  page: number
  page_size: number
}

export interface BackendProblem {
  id: string
  title: string
  description?: string | null
  difficulty?: string | null
  tags?: string[] | null
  test_cases: BackendProblemTestCase[]
  solution_languages: string[]
  default_language?: string | null
  has_editorial: boolean
}

export interface BackendProblemTestCase {
  input: string
  expectedOutput: string
}

export interface ProblemListItem {
  id: string
  title: string
  difficulty?: string | null
  tags?: string[] | null
  solution_languages: string[]
}

export interface ExecuteResultCase {
  expected: string
  actual: string
  passed: boolean
}

export interface ExecuteResponseData {
  stdout: string
  stderr: string
  executionTime: string
  memory: string
  status: string
  passed?: boolean
  cases?: ExecuteResultCase[]
}

export interface ExecuteRequestPayload {
  language: string
  code: string
  stdin?: string
  problem_id?: string
  match?: string
  float_tolerance?: number
}

type ErrorResponse = {
  detail?: string | Array<{ msg?: string; [key: string]: unknown }>
  [key: string]: unknown
}

export interface ProblemSolutionPayload {
  language: string
  code: string
  explanation?: string
}

export interface ProblemImportPayload {
  title: string
  description?: string
  difficulty?: string
  tags?: string[]
  test_cases: BackendProblemTestCase[]
  solutions: ProblemSolutionPayload[]
  editorial?: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  })

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`
    try {
      const data = (await res.json()) as ErrorResponse
      if (data?.detail) {
        if (Array.isArray(data.detail)) {
          const parts = data.detail
            .map((item) => (typeof item === "string" ? item : item.msg ?? ""))
            .filter((part) => part && part.length > 0)
          if (parts.length > 0) {
            message = parts.join("; ")
          }
        } else if (typeof data.detail === "string") {
          message = data.detail
        }
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}

export async function fetchKnowledgeItems(params: FetchParams = {}): Promise<BackendKnowledgeItem[]> {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value))
    }
  })

  const queryString = query.toString()
  const data = await request<PaginatedKnowledgeResponse>(`/api/v1/items${queryString ? `?${queryString}` : ""}`)
  return data.items
}

interface QuestionResponse {
  id: string
  text: string
  tags?: string[] | null
  difficulty?: string | null
}

interface CreateQuestionPayload {
  text: string
  tags?: string[]
  difficulty?: string
}

export async function createQuestionAndGenerate(payload: CreateQuestionPayload): Promise<BackendKnowledgeItem> {
  const created = await request<QuestionResponse[]>("/api/v1/questions", {
    method: "POST",
    body: JSON.stringify({ items: [payload] }),
  })

  if (!created || created.length === 0) {
    throw new Error("Question creation failed")
  }

  const questionId = created[0].id
  const generated = await request<BackendKnowledgeItem>("/api/v1/generate", {
    method: "POST",
    body: JSON.stringify({ question_id: questionId }),
  })
  return generated
}

export async function deleteKnowledgeItem(id: string): Promise<void> {
  await request<void>(`/api/v1/items/${id}`, {
    method: "DELETE",
  })
}

export async function fetchProblem(id: string): Promise<BackendProblem> {
  return request<BackendProblem>(`/api/v1/problems/${id}`)
}

export async function executeCode(payload: ExecuteRequestPayload): Promise<ExecuteResponseData> {
  return request<ExecuteResponseData>("/api/v1/execute", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function fetchProblemSolution(id: string, language?: string): Promise<ProblemSolutionPayload> {
  const query = language ? `?language=${encodeURIComponent(language)}` : ""
  return request<ProblemSolutionPayload>(`/api/v1/problems/${id}/solution${query}`)
}

export async function fetchProblemEditorial(id: string): Promise<string> {
  const data = await request<{ editorial: string }>(`/api/v1/problems/${id}/editorial`)
  return data.editorial
}

export async function fetchProblemList(params: { difficulty?: string; tag?: string } = {}): Promise<ProblemListItem[]> {
  const query = new URLSearchParams()
  if (params.difficulty) query.set("difficulty", params.difficulty)
  if (params.tag) query.set("tag", params.tag)
  const queryString = query.toString()
  return request<ProblemListItem[]>(`/api/v1/problems${queryString ? `?${queryString}` : ""}`)
}

export async function importProblem(payload: ProblemImportPayload): Promise<BackendProblem> {
  return request<BackendProblem>("/api/v1/problems/import", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
