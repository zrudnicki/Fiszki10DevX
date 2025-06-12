# REST API Implementation Plan

## Przegląd architektury

Implementacja REST API dla aplikacji Fiszki wykorzystującej Astro 5, Supabase i TypeScript. API składa się z 6 głównych grup endpointów obsługujących pełny cykl życia fiszek - od tworzenia po naukę z wykorzystaniem algorytmu spaced repetition.

## Struktura plików do utworzenia

```
src/
├── pages/api/                    # Astro API endpoints
│   ├── collections/
│   │   ├── index.ts             # GET, POST /api/collections
│   │   └── [id].ts              # GET, PUT, DELETE /api/collections/{id}
│   ├── categories/
│   │   ├── index.ts             # GET, POST /api/categories  
│   │   └── [id].ts              # GET, PUT, DELETE /api/categories/{id}
│   ├── flashcards/
│   │   ├── index.ts             # GET, POST /api/flashcards
│   │   ├── bulk.ts              # POST /api/flashcards/bulk
│   │   └── [id].ts              # GET, PUT, DELETE /api/flashcards/{id}
│   ├── generate/
│   │   └── flashcards/
│   │       ├── index.ts         # POST /api/generate/flashcards
│   │       └── [id]/
│   │           └── accept.ts    # POST /api/generate/flashcards/{id}/accept
│   ├── stats/
│   │   ├── generation.ts        # GET, PUT /api/stats/generation
│   │   └── learning.ts          # GET /api/stats/learning
│   └── study/
│       ├── next.ts              # GET /api/study/next
│       └── sessions/
│           └── [id]/
│               └── review.ts    # POST /api/study/sessions/{id}/review
├── lib/
│   ├── services/                # Business logic services
│   │   ├── collections.service.ts
│   │   ├── categories.service.ts
│   │   ├── flashcards.service.ts
│   │   ├── ai-generation.service.ts
│   │   ├── statistics.service.ts
│   │   └── study.service.ts
│   ├── schemas/                 # Zod validation schemas
│   │   ├── collections.schema.ts
│   │   ├── categories.schema.ts
│   │   ├── flashcards.schema.ts
│   │   ├── ai-generation.schema.ts
│   │   ├── statistics.schema.ts
│   │   └── study.schema.ts
│   └── utils/
│       ├── api-helpers.ts       # Common API utilities
│       ├── auth.utils.ts        # Authentication helpers
│       └── validation.utils.ts  # Validation utilities
└── types/
    ├── api.types.ts             # API request/response types
    └── dto.types.ts             # Data Transfer Objects
```

---

# Collections API Implementation Plan

## 1. Przegląd punktu końcowego

Collections API zapewnia pełne operacje CRUD dla kolekcji fiszek. Kolekcje służą do organizacji fiszek w logiczne grupy tematyczne. Wszystkie operacje są automatycznie filtrowane według zalogowanego użytkownika poprzez Supabase RLS.

## 2. Szczegóły żądania

### GET /api/collections
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/collections`
- **Parametry**:
  - Opcjonalne: 
    - `limit`: number (default: 50, max: 100)
    - `offset`: number (default: 0)
    - `sort`: "name" | "created_at" (default: "created_at")
    - `order`: "asc" | "desc" (default: "desc")

### POST /api/collections
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/collections`
- **Request Body**:
```typescript
{
  name: string,        // max 100 chars, required
  description?: string // max 500 chars, optional
}
```

### GET /api/collections/{id}
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/collections/{id}`
- **Parametry**:
  - Wymagane: `id` (UUID)

### PUT /api/collections/{id}
- **Metoda HTTP**: PUT
- **Struktura URL**: `/api/collections/{id}`
- **Parametry**:
  - Wymagane: `id` (UUID)
- **Request Body**:
```typescript
{
  name?: string,        // max 100 chars, optional
  description?: string  // max 500 chars, optional
}
```

### DELETE /api/collections/{id}
- **Metoda HTTP**: DELETE
- **Struktura URL**: `/api/collections/{id}`
- **Parametry**:
  - Wymagane: `id` (UUID)

## 3. Wykorzystywane typy

```typescript
// DTO Types
interface CollectionDTO {
  id: string;
  name: string;
  description: string | null;
  flashcard_count: number;
  created_at?: string;
  updated_at?: string;
}

interface CreateCollectionRequest {
  name: string;
  description?: string;
}

interface UpdateCollectionRequest {
  name?: string;
  description?: string;
}

interface CollectionsListResponse {
  data: CollectionDTO[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}
```

## 4. Szczegóły odpowiedzi

### GET /api/collections - 200 OK
```typescript
{
  data: CollectionDTO[],
  pagination: {
    total: number,
    limit: number,
    offset: number
  }
}
```

### POST /api/collections - 201 Created
```typescript
CollectionDTO
```

### GET /api/collections/{id} - 200 OK
```typescript
CollectionDTO
```

### PUT /api/collections/{id} - 200 OK
```typescript
CollectionDTO
```

### DELETE /api/collections/{id} - 204 No Content

## 5. Przepływ danych

1. **Autentykacja**: Walidacja Supabase JWT token
2. **Walidacja**: Zod schema validation dla request body
3. **Business Logic**: CollectionsService operations
4. **Database**: Supabase queries z automatycznym RLS filtering
5. **Response**: Formatted response z proper HTTP status codes

## 6. Względy bezpieczeństwa

- **Autentykacja**: Required Supabase JWT token w Authorization header
- **Autoryzacja**: RLS policies zapewniają dostęp tylko do własnych kolekcji
- **Walidacja**: Zod schemas dla input validation
- **Sanityzacja**: HTML/SQL injection prevention

## 7. Obsługa błędów

- **400 Bad Request**: Validation errors, length constraints
- **401 Unauthorized**: Missing/invalid JWT token
- **404 Not Found**: Collection not found lub not owned by user
- **500 Internal Server Error**: Database/server errors

## 8. Rozważania dotyczące wydajności

- **Pagination**: Default limit 50, max 100
- **Indexing**: Database indexes na user_id, created_at
- **Query optimization**: Efficient count queries dla pagination
- **Caching**: Potential Redis caching dla frequently accessed collections

## 9. Etapy wdrożenia

### Krok 1: Stworzenie schemas i typów
```typescript
// src/lib/schemas/collections.schema.ts
// src/types/dto.types.ts - CollectionDTO types
```

### Krok 2: Implementacja CollectionsService
```typescript
// src/lib/services/collections.service.ts
// Business logic operations
```

### Krok 3: API endpoints
```typescript
// src/pages/api/collections/index.ts - GET, POST
// src/pages/api/collections/[id].ts - GET, PUT, DELETE
```

### Krok 4: Error handling i logging
```typescript
// src/lib/utils/api-helpers.ts
// Centralized error handling
```

### Krok 5: Testing i validation

---

# Categories API Implementation Plan

## 1. Przegląd punktu końcowego

Categories API zarządza kategoriami fiszek, umożliwiając klasyfikację i organizację treści edukacyjnych. Kategorie mają unikalne nazwy per user i są opcjonalnie przypisywane do fiszek.

## 2. Szczegóły żądania

### GET /api/categories
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/categories`
- **Parametry**:
  - Opcjonalne: 
    - `limit`: number (default: 50, max: 100)
    - `offset`: number (default: 0)
    - `sort`: "name" | "created_at" (default: "created_at")
    - `order`: "asc" | "desc" (default: "desc")

### POST /api/categories
- **Metoda HTTP**: POST
- **Request Body**:
```typescript
{
  name: string,        // max 50 chars, required, unique per user
  description?: string // max 200 chars, optional
}
```

### PUT /api/categories/{id}
- **Metoda HTTP**: PUT
- **Struktura URL**: `/api/categories/{id}`
- **Parametry**:
  - Wymagane: `id` (UUID)
- **Request Body**:
```typescript
{
  name?: string,        // max 50 chars, optional, unique per user
  description?: string  // max 200 chars, optional
}
```

### DELETE /api/categories/{id}
- **Metoda HTTP**: DELETE
- **Struktura URL**: `/api/categories/{id}`
- **Parametry**:
  - Wymagane: `id` (UUID)

## 3. Wykorzystywane typy

```typescript
interface CategoryDTO {
  id: string;
  name: string;
  description: string | null;
  flashcard_count: number;
  created_at?: string;
  updated_at?: string;
}

interface CreateCategoryRequest {
  name: string;
  description?: string;
}
```

## 4. Szczegóły odpowiedzi

### GET /api/categories - 200 OK
```typescript
{
  data: CategoryDTO[],
  pagination: {
    total: number,
    limit: number,
    offset: number
  }
}
```

### POST /api/categories - 201 Created
```typescript
CategoryDTO
```

### GET /api/categories/{id} - 200 OK
```typescript
CategoryDTO
```

### PUT /api/categories/{id} - 200 OK
```typescript
CategoryDTO
```

### DELETE /api/categories/{id} - 204 No Content

## 5. Przepływ danych

1. **Autentykacja**: Walidacja Supabase JWT token
2. **Walidacja**: Zod schema validation dla request body + unique name constraint
3. **Business Logic**: CategoriesService operations z check dla duplikatów nazw
4. **Database**: Supabase queries z automatycznym RLS filtering
5. **Response**: Formatted response z proper HTTP status codes

## 6. Względy bezpieczeństwa

- **Autentykacja**: Required Supabase JWT token w Authorization header
- **Autoryzacja**: RLS policies zapewniają dostęp tylko do własnych kategorii
- **Walidacja**: Zod schemas dla input validation plus unique constraint checking
- **Sanityzacja**: HTML/SQL injection prevention

## 7. Obsługa błędów

- **400 Bad Request**: Validation errors, length constraints (name > 50 chars, description > 200 chars)
- **401 Unauthorized**: Missing/invalid JWT token
- **404 Not Found**: Category not found lub not owned by user
- **409 Conflict**: Category name already exists for user
- **500 Internal Server Error**: Database/server errors

## 8. Rozważania dotyczące wydajności

- **Pagination**: Default limit 50, max 100
- **Unique Constraint**: Database-level unique constraint na (user_id, name)
- **Indexing**: Database indexes na user_id, name, created_at
- **Query optimization**: Efficient count queries dla pagination
- **Caching**: Potential Redis caching dla frequently accessed categories

## 9. Etapy wdrożenia

### Krok 1: Stworzenie schemas i typów
```typescript
// src/lib/schemas/categories.schema.ts
// Validation z unique name constraint
// src/types/dto.types.ts - CategoryDTO types
```

### Krok 2: Implementacja CategoriesService
```typescript
// src/lib/services/categories.service.ts
// Business logic z unique name checking
```

### Krok 3: API endpoints
```typescript
// src/pages/api/categories/index.ts - GET, POST
// src/pages/api/categories/[id].ts - GET, PUT, DELETE
```

### Krok 4: Error handling i unique constraint validation
```typescript
// src/lib/utils/api-helpers.ts
// Centralized error handling dla conflict errors
```

### Krok 5: Testing i validation z unique constraints

---

# Flashcards API Implementation Plan

## 1. Przegląd punktu końcowego

Flashcards API obsługuje główne entity aplikacji - fiszki. Zapewnia CRUD operations plus bulk creation dla AI-generated content. Implementuje spaced repetition fields i source tracking.

## 2. Szczegóły żądania

### GET /api/flashcards
- **Metoda HTTP**: GET
- **Parametry**:
  - Opcjonalne: `collection_id`, `category_id`, `limit`, `offset`, `sort`, `order`

### POST /api/flashcards
- **Request Body**:
```typescript
{
  front: string,           // max 200 chars, required
  back: string,            // max 500 chars, required
  collection_id: string,   // required, must exist and be owned by user
  category_id?: string,    // optional, must exist and be owned by user
  source?: "manual" | "ai_generated" // default: "manual"
}
```

### POST /api/flashcards/bulk
- **Request Body**:
```typescript
{
  flashcards: Array<{
    front: string,
    back: string,
    collection_id: string,
    category_id?: string,
    source?: "manual" | "ai_generated"
  }>
}
```

## 3. Wykorzystywane typy

```typescript
interface FlashcardDTO {
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

interface CreateFlashcardRequest {
  front: string;
  back: string;
  collection_id: string;
  category_id?: string;
  source?: "manual" | "ai_generated";
}

interface BulkCreateFlashcardsRequest {
  flashcards: CreateFlashcardRequest[];
}

interface BulkCreateResponse {
  created: number;
  flashcards: FlashcardDTO[];
}
```

## 4. Szczegóły odpowiedzi

### POST /api/flashcards/bulk - 201 Created
```typescript
{
  created: number,
  flashcards: FlashcardDTO[]
}
```

## 5. Przepływ danych

1. **Validation**: Collection/category existence i ownership
2. **Spaced Repetition**: Initialize default values dla nowych fiszek
3. **Bulk Operations**: Transaction-based bulk inserts
4. **Statistics**: Update generation stats dla AI-created flashcards

## 6. Względy bezpieczeństwa

- **Autentykacja**: Required Supabase JWT token w Authorization header
- **Autoryzacja**: RLS policies zapewniają dostęp tylko do własnych fiszek
- **Foreign Key Validation**: Weryfikacja że collection_id i category_id należą do użytkownika
- **Walidacja**: Zod schemas dla input validation z length constraints
- **Sanityzacja**: HTML/SQL injection prevention dla front/back content

## 7. Obsługa błędów

- **400 Bad Request**: Validation errors, length constraints (front > 200 chars, back > 500 chars)
- **401 Unauthorized**: Missing/invalid JWT token
- **404 Not Found**: 
  - Flashcard not found lub not owned by user
  - Collection/category not found lub not owned by user
- **422 Unprocessable Entity**: Invalid collection_id lub category_id references
- **500 Internal Server Error**: Database/server errors

## 8. Rozważania dotyczące wydajności

- **Pagination**: Default limit 50, max 100
- **Indexing**: Database indexes na user_id, collection_id, category_id, created_at
- **Bulk Operations**: Transaction-based bulk inserts dla performance
- **Query optimization**: Efficient filtering by collection/category
- **Spaced Repetition**: Optimized queries dla next_review_date calculations

## 9. Etapy wdrożenia

### Krok 1: Stworzenie schemas i typów
```typescript
// src/lib/schemas/flashcards.schema.ts
// Validation z foreign key constraints
// src/types/dto.types.ts - FlashcardDTO types
```

### Krok 2: Implementacja FlashcardsService
```typescript
// src/lib/services/flashcards.service.ts
// Business logic z foreign key validation
// Bulk operations support
```

### Krok 3: Spaced Repetition Utils
```typescript
// src/lib/utils/spaced-repetition.ts
// SM-2 algorithm dla default values
```

### Krok 4: API endpoints
```typescript
// src/pages/api/flashcards/index.ts - GET, POST
// src/pages/api/flashcards/bulk.ts - POST bulk
// src/pages/api/flashcards/[id].ts - GET, PUT, DELETE
```

### Krok 5: Foreign key validation i error handling
```typescript
// src/lib/utils/api-helpers.ts
// Validation dla collection/category ownership
```

### Krok 6: Testing z foreign key constraints i bulk operations

---

# AI Generation API Implementation Plan

## 1. Przegląd punktu końcowego

AI Generation API integruje się z OpenRouter.ai do generowania fiszek z tekstu. Implementuje dwuetapowy proces: generation → review → acceptance z tracking statistik.

## 2. Szczegóły żądania

### POST /api/generate/flashcards
- **Request Body**:
```typescript
{
  text: string,           // 1000-10000 chars, required
  collection_id: string,  // target collection
  category_id?: string    // optional category
}
```

### POST /api/generate/flashcards/{generation_id}/accept
- **Request Body**:
```typescript
{
  accepted_cards: Array<{
    front: string,
    back: string,
    edited: boolean        // track if user modified AI suggestion
  }>,
  collection_id: string,
  category_id?: string
}
```

## 3. Wykorzystywane typy

```typescript
interface GenerateFlashcardsRequest {
  text: string;
  collection_id: string;
  category_id?: string;
}

interface FlashcardCandidate {
  front: string;
  back: string;
}

interface GenerateFlashcardsResponse {
  candidates: FlashcardCandidate[];
  generation_id: string;
}

interface AcceptFlashcardsRequest {
  accepted_cards: Array<{
    front: string;
    back: string;
    edited: boolean;
  }>;
  collection_id: string;
  category_id?: string;
}
```

## 4. Szczegóły odpowiedzi

### POST /api/generate/flashcards - 200 OK
```typescript
{
  candidates: FlashcardCandidate[],
  generation_id: string
}
```

## 5. Przepływ danych

1. **Rate Limiting**: 10 requests per minute per user
2. **OpenRouter Integration**: Send text to AI model
3. **Candidate Storage**: Temporary storage dla review
4. **Statistics Tracking**: Increment generation counters
5. **Acceptance Processing**: Create flashcards + update stats

## 6. Względy bezpieczeństwa

- **Rate Limiting**: Custom middleware dla AI endpoints
- **Text Validation**: Length constraints, content filtering
- **API Key Security**: OpenRouter credentials w environment variables
- **Cost Control**: Request size limits, timeout handling

## 7. Obsługa błędów

- **422 Unprocessable Entity**: AI generation failed
- **429 Too Many Requests**: Rate limit exceeded
- **400 Bad Request**: Text length constraints

## 8. Rozważania dotyczące wydajności

- **Async Processing**: Non-blocking AI calls
- **Timeout Handling**: 30s timeout dla AI requests
- **Retry Logic**: Exponential backoff dla failed requests
- **Cost Monitoring**: Track OpenRouter usage

---

# Statistics API Implementation Plan

## 1. Przegląd punktu końcowego

Statistics API dostarcza analytics dla AI generation i learning progress. Wspiera monitoring efektywności AI oraz postępów użytkownika w nauce.

## 2. Szczegóły żądania

### GET /api/stats/generation
- **Metoda HTTP**: GET
- **Response**: AI generation statistics

### PUT /api/stats/generation
- **Request Body**:
```typescript
{
  total_generated: number,
  total_accepted_direct: number,
  total_accepted_edited: number
}
```

### GET /api/stats/learning
- **Parametry**:
  - Opcjonalne: `collection_id`, `period` ("week"|"month"|"year"|"all")

## 3. Wykorzystywane typy

```typescript
interface GenerationStatsDTO {
  total_generated: number;
  total_accepted_direct: number;
  total_accepted_edited: number;
  acceptance_rate: number;
  edit_rate: number;
}

interface LearningStatsDTO {
  total_flashcards: number;
  total_reviews: number;
  accuracy_rate: number;
  average_session_time: number;
}
```

## 4. Szczegóły odpowiedzi

### GET /api/stats/generation - 200 OK
```typescript
{
  total_generated: number,
  total_accepted_direct: number,
  total_accepted_edited: number,
  acceptance_rate: number,
  edit_rate: number
}
```

### PUT /api/stats/generation - 200 OK
```typescript
{
  total_generated: number,
  total_accepted_direct: number,
  total_accepted_edited: number,
  acceptance_rate: number,
  edit_rate: number
}
```

### GET /api/stats/learning - 200 OK
```typescript
{
  total_flashcards: number,
  total_reviews: number,
  accuracy_rate: number,
  average_session_time: number,
  period_data?: {
    period: string,
    collection_id?: string,
    start_date: string,
    end_date: string
  }
}
```

## 5. Przepływ danych

### Generation Statistics Flow:
1. **Autentykacja**: Walidacja Supabase JWT token
2. **Database Query**: Pobieranie z flashcard_generation_stats table
3. **Calculations**: 
   - `acceptance_rate = (total_accepted_direct + total_accepted_edited) / total_generated`
   - `edit_rate = total_accepted_edited / (total_accepted_direct + total_accepted_edited)`
4. **Response**: Formatted statistics z computed rates

### Learning Statistics Flow:
1. **Autentykacja**: Walidacja Supabase JWT token
2. **Period Filtering**: Calculate date ranges based na period parameter
3. **Aggregations**: 
   - Count total flashcards (optionally filtered by collection)
   - Count total reviews w specified period
   - Calculate accuracy rate z review results
   - Average session time z study_sessions data
4. **Response**: Comprehensive learning analytics

## 6. Względy bezpieczeństwa

- **Autentykacja**: Required Supabase JWT token w Authorization header
- **Autoryzacja**: RLS policies zapewniają dostęp tylko do własnych statistics
- **Data Privacy**: Statistics są agregowane i nie ujawniają szczegółów content
- **Rate Limiting**: Reasonable limits dla statistics queries (nie heavyweight)

## 7. Obsługa błędów

- **400 Bad Request**: Invalid period parameter lub malformed update data
- **401 Unauthorized**: Missing/invalid JWT token
- **404 Not Found**: User statistics nie istnieją (auto-create dla nowych users)
- **422 Unprocessable Entity**: Invalid statistics update (np. accepted > generated)
- **500 Internal Server Error**: Database aggregation errors

## 8. Rozważania dotyczące wydajności

- **Materialized Views**: Consider materialized views dla complex aggregations
- **Caching**: Redis cache dla frequently accessed statistics (TTL: 15 minutes)
- **Indexed Queries**: Optimized indexes na timestamp fields dla period filtering
- **Batch Updates**: Efficient updates dla generation statistics
- **Query Optimization**: 
  - Use window functions dla running calculations
  - Partition by user_id dla performance
  - Limit result sets appropriately

## 9. Etapy wdrożenia

### Krok 1: Database optimizations
```typescript
// Database indexes dla performance
// Consider materialized views dla complex aggregations
```

### Krok 2: Statistics calculation utilities
```typescript
// src/lib/utils/statistics.utils.ts
// Helper functions dla rate calculations
// Period filtering utilities
```

### Krok 3: StatisticsService implementation
```typescript
// src/lib/services/statistics.service.ts
// Aggregation logic dla generation i learning stats
// Period-based filtering
```

### Krok 4: API endpoints
```typescript
// src/pages/api/stats/generation.ts - GET, PUT
// src/pages/api/stats/learning.ts - GET
```

### Krok 5: Caching layer
```typescript
// Redis integration dla statistics caching
// Cache invalidation strategies
```

### Krok 6: Performance testing i optimization

---

# Study Session API Implementation Plan

## 1. Przegląd punktu końcowego

Study Session API implementuje spaced repetition algorithm (SM-2) dla optymalnego planowania powtórek. Zarządza sesjami nauki i aktualizuje parametry algorytmu.

## 2. Szczegóły żądania

### GET /api/study/next
- **Parametry**:
  - Opcjonalne: `collection_id`, `limit` (default: 10, max: 50)

### POST /api/study/sessions/{session_id}/review
- **Request Body**:
```typescript
{
  reviews: Array<{
    flashcard_id: string,
    result: "correct" | "incorrect" | "partial",
    response_time: number  // seconds
  }>
}
```

## 3. Wykorzystywane typy

```typescript
interface StudyFlashcardDTO {
  id: string;
  front: string;
  back: string;
  due_date: string;
}

interface StudySessionDTO {
  session_id: string;
  flashcards: StudyFlashcardDTO[];
}

interface ReviewRequest {
  reviews: Array<{
    flashcard_id: string;
    result: "correct" | "incorrect" | "partial";
    response_time: number;
  }>;
}

interface ReviewResponse {
  processed: number;
  next_review_dates: Record<string, string>;
}
```

## 4. Szczegóły odpowiedzi

### GET /api/study/next - 200 OK
```typescript
{
  flashcards: StudyFlashcardDTO[],
  session_id: string
}
```

## 5. Przepływ danych

1. **Due Date Calculation**: Query flashcards due for review
2. **Session Creation**: Create new study session record
3. **SM-2 Algorithm**: Calculate next review dates based on performance
4. **Statistics Update**: Track review performance

## 6. Względy bezpieczeństwa

- **Session Validation**: Verify session ownership
- **Performance Tracking**: Prevent manipulation of review results

## 7. Obsługa błędów

- **404 Not Found**: Session not found lub expired
- **400 Bad Request**: Invalid review results

## 8. Rozważania dotyczące wydajności

- **Efficient Queries**: Index on next_review_date
- **Session Caching**: Redis cache dla active sessions
- **Batch Updates**: Bulk update review results

## 9. Etapy wdrożenia

### Krok 1: SM-2 Algorithm Implementation
```typescript
// src/lib/utils/spaced-repetition.ts
// SuperMemo-2 algorithm implementation
```

### Krok 2: Study Service
```typescript
// src/lib/services/study.service.ts
// Session management, due date calculations
```

### Krok 3: API Endpoints
```typescript
// src/pages/api/study/next.ts
// src/pages/api/study/sessions/[id]/review.ts
```

---

# Wspólne elementy implementacji

## API Helpers i Utilities

```typescript
// src/lib/utils/api-helpers.ts
export const withAuth = (handler: APIHandler) => {
  return async (context: APIContext) => {
    const token = extractJWTToken(context.request.headers);
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    context.locals.user = await validateSupabaseToken(token);
    return handler(context);
  };
};

export const handleAPIError = (error: unknown) => {
  if (error instanceof ZodError) {
    return new Response(JSON.stringify({ 
      error: 'Validation failed', 
      details: error.errors 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  console.error('API Error:', error);
  return new Response(JSON.stringify({ error: 'Internal server error' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

## Middleware Setup

```typescript
// src/middleware/index.ts - rozszerzenie istniejącego
export const onRequest = defineMiddleware(async (context, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  context.locals.session = session;
  context.locals.user = session?.user ?? null;
  context.locals.supabase = supabase;

  return next();
});
```

## Environment Variables

```env
# .env
PUBLIC_SUPABASE_URL=URL...
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

Ten plan implementacji zapewnia kompletną strukturę dla wszystkich endpointów REST API zgodnie ze specyfikacją i najlepszymi praktykami Astro/Supabase. 