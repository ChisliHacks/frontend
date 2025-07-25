const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export interface LoginData {
  username: string;
  password: string;
}

export interface SignupData {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  lessons_completed: number;
  total_lesson_score: number;
}

export interface TopPerformer {
  id: number;
  username: string;
  lessons_completed: number;
  total_lesson_score: number;
  average_score: number;
  created_at?: string;
}

export interface LeaderboardResponse {
  top_performers: TopPerformer[];
  total_count: number;
}

export interface JobPerformer extends TopPerformer {
  job_specific_score: number;
  related_lessons_count: number;
}

export interface JobInfo {
  id: number;
  position: string;
  company?: string;
  job_type?: string;
  experience_level?: string;
  industry?: string;
  related_lessons_count: number;
}

export interface JobLeaderboardEntry {
  job_info: JobInfo;
  top_performers: JobPerformer[];
}

export interface JobLeaderboardResponse {
  [jobPosition: string]: JobLeaderboardEntry;
}

export interface UserBestJobPerformance {
  job_info: {
    id: number;
    position: string;
    company?: string;
    job_type?: string;
    experience_level?: string;
    industry?: string;
  };
  performance: {
    total_job_score: number;
    completed_lessons: number;
    average_score: number;
    related_lessons_available: number;
  };
}

export interface Job {
  id: number;
  position: string;
  company: string;
  description?: string;
  job_criteria: string;
  location?: string;
  salary_range?: string;
  job_type: string;
  remote_option: boolean;
  experience_level: string;
  is_active: boolean;
  recruiter_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface JobBasic {
  id: number;
  position: string;
  company: string;
  location?: string;
  job_type: string;
  experience_level: string;
}

export interface RelatedJobBasic {
  id: number;
  position: string;
  company?: string;
  job_type?: string;
  experience_level?: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  summary: string;
  category: string;
  filename: string;
  duration_minutes: number;
  difficulty_level: string;
  lesson_score: number;
  created_at: string;
  updated_at?: string;
  related_jobs?: RelatedJobBasic[];
}

export interface LessonListItem {
  id: number;
  title: string;
  description: string;
  summary: string;
  category: string;
  filename: string;
  duration_minutes: number;
  difficulty_level: string;
  lesson_score: number;
  created_at: string;
  related_jobs?: RelatedJobBasic[];
}

export interface LessonCreate {
  title: string;
  description?: string;
  summary?: string;
  category: string;
  filename?: string;
  duration_minutes?: number;
  difficulty_level?: string;
  lesson_score?: number;
  related_job_ids?: number[];
  related_job_positions?: string[];
}

export interface LessonUpdate {
  title?: string;
  description?: string;
  summary?: string;
  category?: string;
  filename?: string;
  duration_minutes?: number;
  difficulty_level?: string;
  lesson_score?: number;
  related_job_ids?: number[];
  related_job_positions?: string[];
}

export interface FileUploadResponse {
  message: string;
  filename: string;
  original_filename: string;
  file_size: number;
}

export interface LessonMaterialUploadResponse {
  message: string;
  filename: string;
  original_filename: string;
  file_size: number;
  text_extracted: boolean;
  text_length: number;
  summary?: string;
  text_extraction_error?: string;
  summary_error?: string;
  extracted_text_preview?: string;
}

export interface ChatMessage {
  role: string; // "user" or "assistant"
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  conversation_id?: string;
}

export interface SummarizeRequest {
  text: string;
  summary_type?: string; // "general", "key_points", "brief"
}

export interface SummarizeResponse {
  summary: string;
  original_length: number;
  summary_length: number;
}

export interface LessonSummaryRequest {
  lesson_id: number;
  summary_type?: string;
}

export interface LessonSummaryResponse {
  lesson_id: number;
  lesson_title: string;
  summary: string;
  key_points: string[];
}

export interface ChapterizedSummaryRequest {
  lesson_id: number;
}

export interface ChapterizedSummaryResponse {
  lesson_id: number;
  lesson_title: string;
  summary: string;
  chapters: string[];
  chapter_count: number;
}

export interface AIStatusResponse {
  status: string;
  model: string;
  model_available: boolean;
  message: string;
}

export interface JobSuggestionRequest {
  lesson_title: string;
  lesson_description: string;
  lesson_category: string;
}

export interface JobSuggestionResponse {
  suggested_job_positions: string[];
  reasoning: string;
}

export interface CategorySuggestionRequest {
  lesson_title: string;
  lesson_description?: string;
  lesson_content?: string;
}

export interface CategorySuggestionResponse {
  suggested_category: string;
  reasoning: string;
}

export interface Job {
  id: number;
  position: string;
  company: string;
  description?: string;
  job_criteria: string;
  location?: string;
  salary_range?: string;
  job_type: string;
  remote_option: boolean;
  experience_level: string;
  is_active: boolean;
  recruiter_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface JobListItem {
  id: number;
  position: string;
  company: string;
  description?: string;
  location?: string;
  salary_range?: string;
  job_type: string;
  remote_option: boolean;
  experience_level: string;
  is_active: boolean;
  created_at: string;
}

export interface JobCreate {
  position: string;
  company: string;
  description?: string;
  job_criteria: string;
  location?: string;
  salary_range?: string;
  job_type?: string;
  remote_option?: boolean;
  experience_level?: string;
  is_active?: boolean;
  recruiter_id?: number;
}

export interface JobUpdate {
  position?: string;
  company?: string;
  description?: string;
  job_criteria?: string;
  location?: string;
  salary_range?: string;
  job_type?: string;
  remote_option?: boolean;
  experience_level?: string;
  is_active?: boolean;
  recruiter_id?: number;
}

class ApiError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const authApi = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Login failed", response.status);
    }

    return response.json();
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Registration failed", response.status);
    }

    return response.json();
  },

  async getProfile(): Promise<UserProfile> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to fetch profile", response.status);
    }

    return response.json();
  },

  async updateProfile(email?: string): Promise<UserProfile> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "PUT",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to update profile", response.status);
    }

    return response.json();
  },

  async completeLesson(lessonId: number): Promise<{ success: boolean; message: string; points_earned: number; total_lessons_completed: number; total_score: number }> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to complete lesson", response.status);
    }

    return response.json();
  },

  async getLeaderboard(limit: number = 10): Promise<LeaderboardResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/leaderboard?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to fetch leaderboard", response.status);
    }

    return response.json();
  },

  async getLeaderboardByJobs(limit?: number): Promise<JobLeaderboardResponse> {
    const url = new URL(`${API_BASE_URL}/auth/leaderboard/by-jobs`);
    if (limit) url.searchParams.append("limit", limit.toString());

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to fetch job-specific leaderboard", response.status);
    }

    return response.json();
  },

  async getUserBestJob(): Promise<UserBestJobPerformance> {
    const response = await fetch(`${API_BASE_URL}/auth/me/best-job`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to fetch user's best job performance", response.status);
    }

    return response.json();
  },
};

export const lessonsApi = {
  async getLessons(params?: { skip?: number; limit?: number; category?: string; difficulty_level?: string }): Promise<LessonListItem[]> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.category) queryParams.append("category", params.category);
      if (params.difficulty_level) queryParams.append("difficulty_level", params.difficulty_level);
    }

    const response = await fetch(`${API_BASE_URL}/lessons?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to fetch lessons", response.status);
    }

    return response.json();
  },

  async getPublishedLessons(params?: { skip?: number; limit?: number; category?: string; difficulty_level?: string }): Promise<LessonListItem[]> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.category) queryParams.append("category", params.category);
      if (params.difficulty_level) queryParams.append("difficulty_level", params.difficulty_level);
    }

    const response = await fetch(`${API_BASE_URL}/lessons/published?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to fetch published lessons", response.status);
    }

    return response.json();
  },

  async getLesson(id: number): Promise<Lesson> {
    const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to fetch lesson", response.status);
    }

    return response.json();
  },

  async searchLessons(
    query: string,
    params?: {
      skip?: number;
      limit?: number;
      category?: string;
      difficulty_level?: string;
    }
  ): Promise<LessonListItem[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("q", query);

    if (params) {
      if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.category) queryParams.append("category", params.category);
      if (params.difficulty_level) queryParams.append("difficulty_level", params.difficulty_level);
    }

    const response = await fetch(`${API_BASE_URL}/lessons/search?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to search lessons", response.status);
    }

    return response.json();
  },

  async createLesson(lesson: LessonCreate): Promise<Lesson> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/lessons`, {
      method: "POST",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lesson),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to create lesson", response.status);
    }

    return response.json();
  },

  async updateLesson(id: number, lesson: LessonUpdate): Promise<Lesson> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lesson),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to update lesson", response.status);
    }

    return response.json();
  },

  async deleteLesson(id: number): Promise<void> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to delete lesson", response.status);
    }
  },
};

export const jobsApi = {
  async getJobs(params?: {
    skip?: number;
    limit?: number;
    company?: string;
    location?: string;
    job_type?: string;
    experience_level?: string;
    remote_option?: boolean;
    is_active?: boolean;
  }): Promise<JobListItem[]> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.company) queryParams.append("company", params.company);
      if (params.location) queryParams.append("location", params.location);
      if (params.job_type) queryParams.append("job_type", params.job_type);
      if (params.experience_level) queryParams.append("experience_level", params.experience_level);
      if (params.remote_option !== undefined) queryParams.append("remote_option", params.remote_option.toString());
      if (params.is_active !== undefined) queryParams.append("is_active", params.is_active.toString());
    }

    const response = await fetch(`${API_BASE_URL}/jobs?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to fetch jobs", response.status);
    }

    return response.json();
  },

  async getActiveJobs(params?: { skip?: number; limit?: number; company?: string; location?: string; job_type?: string; experience_level?: string; remote_option?: boolean }): Promise<JobListItem[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("is_active", "true");

    if (params) {
      if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.company) queryParams.append("company", params.company);
      if (params.location) queryParams.append("location", params.location);
      if (params.job_type) queryParams.append("job_type", params.job_type);
      if (params.experience_level) queryParams.append("experience_level", params.experience_level);
      if (params.remote_option !== undefined) queryParams.append("remote_option", params.remote_option.toString());
    }

    const response = await fetch(`${API_BASE_URL}/jobs?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to fetch active jobs", response.status);
    }

    return response.json();
  },

  async getJob(id: number): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to fetch job", response.status);
    }

    return response.json();
  },

  async searchJobs(
    query: string,
    params?: {
      skip?: number;
      limit?: number;
      location?: string;
      job_type?: string;
      experience_level?: string;
      remote_option?: boolean;
    }
  ): Promise<JobListItem[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("q", query);

    if (params) {
      if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.location) queryParams.append("location", params.location);
      if (params.job_type) queryParams.append("job_type", params.job_type);
      if (params.experience_level) queryParams.append("experience_level", params.experience_level);
      if (params.remote_option !== undefined) queryParams.append("remote_option", params.remote_option.toString());
    }

    const response = await fetch(`${API_BASE_URL}/jobs/search?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to search jobs", response.status);
    }

    return response.json();
  },

  async createJob(job: JobCreate): Promise<Job> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: "POST",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to create job", response.status);
    }

    return response.json();
  },

  async updateJob(id: number, job: JobUpdate): Promise<Job> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to update job", response.status);
    }

    return response.json();
  },

  async deleteJob(id: number): Promise<void> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to delete job", response.status);
    }
  },
};

export const tokenUtils = {
  getToken(): string | null {
    return localStorage.getItem("access_token");
  },

  setToken(token: string, tokenType: string = "bearer"): void {
    localStorage.setItem("access_token", token);
    localStorage.setItem("token_type", tokenType);
  },

  removeToken(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export const uploadApi = {
  async uploadLessonMaterial(file: File, filename: string, generateSummary: boolean = true): Promise<LessonMaterialUploadResponse> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload/upload-lesson-material?filename=${encodeURIComponent(filename)}&generate_summary=${generateSummary}`, {
      method: "POST",
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to upload lesson material", response.status);
    }

    return response.json();
  },

  async uploadFile(file: File, filename: string): Promise<FileUploadResponse> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload/upload-file?filename=${encodeURIComponent(filename)}`, {
      method: "POST",
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to upload file", response.status);
    }

    return response.json();
  },

  async deleteFile(filename: string): Promise<void> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/upload/files/${encodeURIComponent(filename)}`, {
      method: "DELETE",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to delete file", response.status);
    }
  },

  getFileUrl(filename: string): string {
    return `${API_BASE_URL}/upload/files/${encodeURIComponent(filename)}`;
  },
};

export const aiApi = {
  async chatWithTuna(request: ChatRequest): Promise<ChatResponse> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to chat with Tuna", response.status);
    }

    return response.json();
  },

  async summarizeText(request: SummarizeRequest): Promise<SummarizeResponse> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/ai/summarize`, {
      method: "POST",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to summarize text", response.status);
    }

    return response.json();
  },

  async summarizeLesson(request: LessonSummaryRequest): Promise<LessonSummaryResponse> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/ai/summarize-lesson`, {
      method: "POST",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to summarize lesson", response.status);
    }

    return response.json();
  },

  async createChapterizedSummary(request: ChapterizedSummaryRequest): Promise<ChapterizedSummaryResponse> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/ai/chapterized-summary`, {
      method: "POST",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to create chapterized summary", response.status);
    }

    return response.json();
  },

  async getAIStatus(): Promise<AIStatusResponse> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/ai/status`, {
      method: "GET",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to get AI status", response.status);
    }

    return response.json();
  },

  async setupModel(): Promise<{ status: string; message: string }> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/ai/setup-model`, {
      method: "POST",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to setup AI model", response.status);
    }

    return response.json();
  },

  async suggestJobs(request: JobSuggestionRequest): Promise<JobSuggestionResponse> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/ai/suggest-jobs`, {
      method: "POST",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to suggest jobs", response.status);
    }

    return response.json();
  },

  async suggestCategory(request: CategorySuggestionRequest): Promise<CategorySuggestionResponse> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/ai/suggest-category`, {
      method: "POST",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Failed to suggest category", response.status);
    }

    return response.json();
  },
};
