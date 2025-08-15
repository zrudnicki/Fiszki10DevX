import type { FlashcardCandidate } from "../../types/dto.types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private apiKey: string;
  private siteUrl: string;
  private siteName: string;

  constructor() {
    this.apiKey = import.meta.env.OPENROUTER_API_KEY;
    this.siteUrl = import.meta.env.SITE_URL || "http://localhost:3000";
    this.siteName = import.meta.env.SITE_NAME || "Fiszki10DevX";
  }

  /**
   * Generate flashcards from text using AI
   */
  async generateFlashcards(text: string, maxCards = 10): Promise<FlashcardCandidate[]> {
    if (!this.isConfigured()) {
      throw new Error("OPENROUTER_API_KEY environment variable is required");
    }

    const systemPrompt = `Jesteś ekspertem w tworzeniu fiszek. Twoim zadaniem jest tworzenie wysokiej jakości fiszek z dostarczonego tekstu.

Zasady:
1. Utwórz dokładnie ${maxCards} fiszek (lub mniej, jeśli tekst nie zawiera wystarczająco informacji)
2. Każda fiszka powinna mieć PRZÓD (pytanie/podpowiedź) i TYŁ (odpowiedź/wyjaśnienie)
3. Przednia strona powinna być zwięzła (max 200 znaków)
4. Tylna strona powinna być wyczerpująca, ale nie za długa (max 500 znaków)
5. Skup się na kluczowych koncepcjach, definicjach, faktach i ważnych szczegółach
6. Upewnij się, że pytania są jasne i jednoznaczne
7. Upewnij się, że odpowiedzi są dokładne i kompletne
8. Różnicuj typy pytań (definicje, wyjaśnienia, przykłady, itp.)
9. Wszystkie fiszki muszą być w języku polskim

Sformatuj swoją odpowiedź jako prawidłową tablicę JSON z dokładnie taką strukturą:
[
  {
    "front": "Pytanie lub podpowiedź tutaj",
    "back": "Odpowiedź lub wyjaśnienie tutaj"
  }
]

Nie dodawaj żadnego tekstu przed lub po tablicy JSON. Zwróć tylko JSON.`;

    const userPrompt = `Utwórz fiszki z tego tekstu:\n\n${text}`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": this.siteUrl,
          "X-Title": this.siteName,
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet", // Using Claude 3.5 Sonnet for high quality
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 2000,
          temperature: 0.3, // Lower temperature for more consistent output
        } as OpenRouterRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from OpenRouter API");
      }

      const content = data.choices[0].message.content;

      // Parse the JSON response
      let flashcards: FlashcardCandidate[];
      try {
        flashcards = JSON.parse(content) as FlashcardCandidate[];
      } catch {
        console.error("Failed to parse OpenRouter response as JSON:", content);
        throw new Error("AI response was not valid JSON format");
      }

      // Validate the response structure
      if (!Array.isArray(flashcards)) {
        throw new Error("AI response was not an array of flashcards");
      }

      // Validate each flashcard
      const validFlashcards = flashcards.filter((card: FlashcardCandidate) => {
        return (
          typeof card === "object" &&
          typeof card.front === "string" &&
          typeof card.back === "string" &&
          card.front.trim().length > 0 &&
          card.back.trim().length > 0 &&
          card.front.length <= 200 &&
          card.back.length <= 500
        );
      });

      if (validFlashcards.length === 0) {
        throw new Error("No valid flashcards were generated");
      }

      console.log(`Generated ${validFlashcards.length} valid flashcards from ${text.length} characters`);

      return validFlashcards;
    } catch (error) {
      console.error("OpenRouter API error:", error);
      throw error;
    }
  }

  /**
   * Check if the API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get rate limit info (placeholder for future implementation)
   */
  async getRateLimit(): Promise<{ remaining: number; reset: number } | null> {
    // This would require storing rate limit info in Redis or database
    // For now, return null to indicate no rate limiting
    return null;
  }
}
