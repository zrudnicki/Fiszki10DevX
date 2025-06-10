// Collection DTOs
export interface CollectionDTO {
  id: string;
  name: string;
  description: string | null;
  flashcard_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string | null;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string | null;
}

export interface CollectionsListResponse {
  data: CollectionDTO[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Category DTOs
export interface CategoryDTO {
  id: string;
  name: string;
  flashcard_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name?: string;
}

export interface CategoriesListResponse {
  data: CategoryDTO[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Flashcard DTOs
export interface FlashcardDTO {
  id: string;
  front: string;
  back: string;
  collection_id: string;
  category_id: string | null;
  source: "manual" | "ai_generated";
  easiness_factor: number;
  interval: number;
  repetitions: number;
  next_review_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFlashcardRequest {
  front: string;
  back: string;
  collection_id: string;
  category_id?: string;
  source?: "manual" | "ai_generated";
}

export interface UpdateFlashcardRequest {
  front?: string;
  back?: string;
  collection_id?: string;
  category_id?: string;
}

export interface BulkCreateFlashcardsRequest {
  flashcards: CreateFlashcardRequest[];
}

export interface BulkCreateFlashcardsResponse {
  created: number;
  flashcards: FlashcardDTO[];
}

export interface FlashcardsListResponse {
  data: FlashcardDTO[];
  pagination: PaginationMeta;
}

// AI Generation DTOs
export interface FlashcardCandidate {
  front: string;
  back: string;
}

export interface GenerateFlashcardsRequest {
  text: string;
  collection_id: string;
  category_id?: string;
  max_cards?: number;
}

export interface GenerateFlashcardsResponse {
  candidates: FlashcardCandidate[];
  generation_id: string;
  text_length: number;
  max_cards: number;
}

export interface AcceptedFlashcard {
  front: string;
  back: string;
  edited: boolean;
}

export interface AcceptFlashcardsRequest {
  accepted_cards: AcceptedFlashcard[];
  collection_id: string;
  category_id?: string;
}

export interface AcceptFlashcardsResponse {
  created: number;
  flashcards: FlashcardDTO[];
  stats_updated: boolean;
}

// Common API response types
export interface PaginationParams {
  limit: number;
  offset: number;
  sort: string;
  order: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface APIError {
  error: string;
  message?: string;
  details?: unknown;
}

// Statistics DTOs
export interface GenerationStatsDTO {
  total_generated: number;
  total_accepted_direct: number;
  total_accepted_edited: number;
  acceptance_rate: number;
  edit_rate: number;
}

export interface UpdateGenerationStatsRequest {
  total_generated?: number;
  total_accepted_direct?: number;
  total_accepted_edited?: number;
}

export interface LearningStatsDTO {
  total_flashcards: number;
  total_reviews: number;
  accuracy_rate: number;
  average_session_time: number;
  reviews_by_period: Array<{
    date: string;
    count: number;
    accuracy: number;
  }>;
}

export interface LearningStatsQuery {
  collection_id?: string;
  period?: "week" | "month" | "year" | "all";
}

// Study Session DTOs
export interface StudySessionDTO {
  id: string;
  user_id: string;
  collection_id: string;
  session_type: "review" | "learn" | "mixed";
  status: "active" | "completed" | "paused";
  started_at: string;
  completed_at?: string;
  session_duration_ms?: number;
  cards_reviewed: number;
  cards_correct: number;
  accuracy_rate?: number;
  next_flashcards: FlashcardDTO[];
}

export interface StartStudySessionRequest {
  collection_id: string;
  session_type?: "review" | "learn" | "mixed";
  max_cards?: number;
}

export interface ReviewFlashcardRequest {
  flashcard_id: string;
  quality: number; // 0-5 SuperMemo scale
  response_time_ms?: number;
  difficulty_felt?: "very_easy" | "easy" | "normal" | "hard" | "very_hard";
}

export interface BatchReviewRequest {
  reviews: ReviewFlashcardRequest[];
}

export interface CompleteSessionRequest {
  session_duration_ms: number;
  cards_reviewed: number;
  accuracy_rate?: number;
}

export interface NextFlashcardDTO {
  id: string;
  front: string;
  back: string;
  collection_id: string;
  category_id?: string;
  repetition_count: number;
  ease_factor: number;
  interval_days: number;
  next_review_date: string;
  last_reviewed?: string;
} 