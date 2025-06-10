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
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
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

    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is required");
    }
  }

  /**
   * Generate flashcards from text using AI
   */
  async generateFlashcards(text: string, maxCards: number = 10): Promise<FlashcardCandidate[]> {
    const systemPrompt = `You are an expert flashcard creator. Your task is to create high-quality flashcards from the provided text.

Rules:
1. Create exactly ${maxCards} flashcards (or fewer if the text doesn't contain enough information)
2. Each flashcard should have a FRONT (question/prompt) and BACK (answer/explanation)
3. Front should be concise (max 200 characters)
4. Back should be comprehensive but not too long (max 500 characters)
5. Focus on key concepts, definitions, facts, and important details
6. Make questions clear and unambiguous
7. Ensure answers are accurate and complete
8. Vary question types (definitions, explanations, examples, etc.)

Format your response as valid JSON array with this exact structure:
[
  {
    "front": "Question or prompt here",
    "back": "Answer or explanation here"
  }
]

Do not include any text before or after the JSON array. Only return the JSON.`;

    const userPrompt = `Create flashcards from this text:\n\n${text}`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": this.siteUrl,
          "X-Title": this.siteName,
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet", // Using Claude 3.5 Sonnet for high quality
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
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
        flashcards = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse OpenRouter response as JSON:", content);
        throw new Error("AI response was not valid JSON format");
      }

      // Validate the response structure
      if (!Array.isArray(flashcards)) {
        throw new Error("AI response was not an array of flashcards");
      }

      // Validate each flashcard
      const validFlashcards = flashcards.filter((card: any) => {
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