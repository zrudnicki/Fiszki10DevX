-- First drop all existing tables and types
DROP TABLE IF EXISTS public.flashcards CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.study_sessions CASCADE;
DROP TABLE IF EXISTS public.flashcard_generation_stats CASCADE;
DROP TYPE IF EXISTS public.session_status CASCADE;
DROP TYPE IF EXISTS public.flashcard_source CASCADE;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE session_status AS ENUM ('active', 'completed', 'abandoned');
CREATE TYPE flashcard_source AS ENUM ('manual', 'ai_generated');

-- Create collections table
CREATE TABLE collections (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT collections_name_length CHECK (char_length(name) <= 250),
    CONSTRAINT collections_description_length CHECK (char_length(description) <= 500),
    CONSTRAINT collections_unique_name_per_user UNIQUE (user_id, name)
);

-- Enable RLS on collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Create categories table
CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT categories_name_length CHECK (char_length(name) <= 250),
    CONSTRAINT categories_unique_name_per_user UNIQUE (user_id, name)
);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create flashcards table
CREATE TABLE flashcards (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    front text NOT NULL,
    back text NOT NULL,
    source flashcard_source NOT NULL DEFAULT 'manual',
    easiness_factor numeric(4,3) NOT NULL DEFAULT 2.5,
    interval integer NOT NULL DEFAULT 1,
    repetitions integer NOT NULL DEFAULT 0,
    next_review_date timestamptz NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 day'),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT flashcards_front_length CHECK (char_length(front) <= 200),
    CONSTRAINT flashcards_back_length CHECK (char_length(back) <= 500),
    CONSTRAINT flashcards_easiness_factor_range CHECK (easiness_factor >= 1.3)
);

-- Enable RLS on flashcards
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create study_sessions table
CREATE TABLE study_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    status session_status NOT NULL DEFAULT 'active',
    flashcards_reviewed_count integer NOT NULL DEFAULT 0,
    started_at timestamptz NOT NULL DEFAULT now(),
    ended_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT study_sessions_reviewed_count_positive CHECK (flashcards_reviewed_count >= 0)
);

-- Enable RLS on study_sessions
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Create flashcard_generation_stats table
CREATE TABLE flashcard_generation_stats (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_generated integer NOT NULL DEFAULT 0,
    total_accepted_direct integer NOT NULL DEFAULT 0,
    total_accepted_edited integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT generation_stats_counts_positive CHECK (
        total_generated >= 0 AND
        total_accepted_direct >= 0 AND
        total_accepted_edited >= 0
    ),
    CONSTRAINT generation_stats_accepted_less_than_generated CHECK (
        total_accepted_direct + total_accepted_edited <= total_generated
    ),
    CONSTRAINT generation_stats_one_per_user UNIQUE (user_id)
);

-- Enable RLS on flashcard_generation_stats
ALTER TABLE flashcard_generation_stats ENABLE ROW LEVEL SECURITY;

-- Create indexes (CORRECTED VERSION)
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_created_at ON collections(created_at);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_created_at ON categories(created_at);

CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_collection_id ON flashcards(collection_id);
CREATE INDEX idx_flashcards_category_id ON flashcards(category_id);
CREATE INDEX idx_flashcards_next_review ON flashcards(user_id, next_review_date);

CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_collection_id ON study_sessions(collection_id);
CREATE INDEX idx_study_sessions_user_started ON study_sessions(user_id, started_at DESC);

-- Create RLS policies
-- Collections
CREATE POLICY "Collections are viewable by owner"
    ON collections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Collections are insertable by owner"
    ON collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Collections are updatable by owner"
    ON collections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Collections are deletable by owner"
    ON collections FOR DELETE
    USING (auth.uid() = user_id);

-- Categories
CREATE POLICY "Categories are viewable by owner"
    ON categories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Categories are insertable by owner"
    ON categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Categories are updatable by owner"
    ON categories FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Categories are deletable by owner"
    ON categories FOR DELETE
    USING (auth.uid() = user_id);

-- Flashcards
CREATE POLICY "Flashcards are viewable by owner"
    ON flashcards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Flashcards are insertable by owner"
    ON flashcards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Flashcards are updatable by owner"
    ON flashcards FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Flashcards are deletable by owner"
    ON flashcards FOR DELETE
    USING (auth.uid() = user_id);

-- Study sessions
CREATE POLICY "Study sessions are viewable by owner"
    ON study_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Study sessions are insertable by owner"
    ON study_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Study sessions are updatable by owner"
    ON study_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Study sessions are deletable by owner"
    ON study_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Generation stats
CREATE POLICY "Generation stats are viewable by owner"
    ON flashcard_generation_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Generation stats are insertable by owner"
    ON flashcard_generation_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Generation stats are updatable by owner"
    ON flashcard_generation_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_flashcards_updated_at
    BEFORE UPDATE ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_study_sessions_updated_at
    BEFORE UPDATE ON study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_generation_stats_updated_at
    BEFORE UPDATE ON flashcard_generation_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create function for automatically ending inactive study sessions
CREATE OR REPLACE FUNCTION auto_end_inactive_sessions()
RETURNS trigger AS $$
BEGIN
    UPDATE study_sessions
    SET status = 'abandoned',
        ended_at = now()
    WHERE status = 'active'
        AND started_at < now() - INTERVAL '30 minutes';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatically ending inactive sessions
CREATE TRIGGER end_inactive_sessions
    AFTER INSERT OR UPDATE ON study_sessions
    FOR EACH STATEMENT
    EXECUTE FUNCTION auto_end_inactive_sessions();