# Plan implementacji widoku Formularza Generowania AI

## 1. Przegląd
Ten widok jest pierwszym krokiem w procesie generowania fiszek z pomocą AI. Użytkownik wprowadza w nim dłuższy fragment tekstu, który posłuży jako materiał źródłowy. Interfejs jest celowo minimalistyczny, aby skupić użytkownika na głównym zadaniu.

## 2. Routing widoku
- **Ścieżka**: `/dashboard/ai/generate`

## 3. Struktura komponentów
```
- AIGeneratePage.astro
  - Layout.astro
    - Main
      - Header (H1 "Wygeneruj fiszki z tekstu", p "Wklej tekst...")
      - Form (HTML <form method="POST">)
        - Card
          - CardContent
            - Label
            - Textarea (dla tekstu źródłowego)
            - p (dla błędu walidacji)
          - CardFooter
            - Button (type="submit", "Generuj")
```

## 4. Szczegóły komponentów
### `AIGeneratePage.astro`
- **Opis komponentu**: Strona Astro renderowana serwerowo, która zawiera formularz i obsługuje jego wysłanie.
- **Główne elementy**: `Layout`, `<form method="POST">`, `Textarea`, `Button`.
- **Logika `---`**:
  - **Dla POST**:
    1. Pobiera dane z `Astro.request.formData()`.
    2. Waliduje dane (długość tekstu) za pomocą schemy Zod.
    3. W razie błędu walidacji, renderuje stronę ponownie z komunikatem o błędzie.
    4. Jeśli dane są poprawne, wywołuje endpoint API: `POST /api/generate/flashcards`.
    5. Po otrzymaniu odpowiedzi z API (z `generation_id`), przekierowuje użytkownika na stronę recenzji: `return Astro.redirect('/dashboard/ai/review/' + generationId)`.

## 5. Typy
- **ViewModel**: Podobnie jak w innych formularzach, można zdefiniować prosty ViewModel do przekazywania wartości i błędów.
  ```typescript
  interface AIGenerateFormViewModel {
    values: { text: string };
    errors?: { text?: string };
  }
  ```
- **DTO**:
  - **Żądanie do API**: `GenerateFlashcardsRequest` (chociaż w tym przypadku ciało żądania jest tworzone w logice POST, a nie bezpośrednio mapowane).
  - **Odpowiedź z API**: `GenerateFlashcardsResponse` (do uzyskania `generation_id`).

## 6. Zarządzanie stanem
Brak stanu po stronie klienta. Stan formularza (wprowadzony tekst, błędy) jest zarządzany przez cykl żądanie-odpowiedź na serwerze.

## 7. Integracja API
- Integracja odbywa się w całości po stronie serwera w `---` w logice POST.
- Wywołanie: `fetch(Astro.url.origin + '/api/generate/flashcards', { method: 'POST', body: JSON.stringify({ text }), headers: ... })`.
  - **Ważne**: Należy przekazać nagłówek autoryzacji z ciasteczka sesji do tego wywołania `fetch`.
- **Typ żądania**: `{ text: string }`.
- **Typ odpowiedzi**: `GenerateFlashcardsResponse`.

## 8. Interakcje użytkownika
- **Wprowadzanie tekstu**: Użytkownik wkleja lub pisze tekst w polu `Textarea`.
- **Wysyłanie**: Użytkownik klika "Generuj".
  - **Sukces**: Zostaje przekierowany na stronę recenzji. W trakcie przetwarzania żądania można wyświetlić stan ładowania na przycisku.
  - **Błąd walidacji**: Strona przeładowuje się, a pod polem `Textarea` pojawia się błąd (np. "Tekst musi mieć od 1000 do 10000 znaków").

## 9. Warunki i walidacja
- **Uwierzytelnienie**: Strona chroniona przez middleware.
- **Walidacja Zod**: Logika POST musi walidować `text` zgodnie z wymaganiami PRD: `string().min(1000).max(10000)`.

## 10. Obsługa błędów
- **Błędy walidacji**: Obsługiwane przez ponowne renderowanie strony z komunikatem błędu.
- **Błędy API**: Jeśli wywołanie `fetch` do `/api/generate/flashcards` zwróci błąd (np. 429 Too Many Requests, 500), należy wyświetlić ogólny komunikat błędu na stronie za pomocą komponentu `Alert`.

## 11. Kroki implementacji
1. Stworzyć plik `src/pages/dashboard/ai/generate.astro`.
2. Użyć `Layout`.
3. Zaimplementować formularz z `Textarea` i przyciskiem "Generuj".
4. W `---` frontmatter zaimplementować logikę dla `Astro.request.method === 'POST'`.
5. Dodać walidację Zod dla pola tekstowego.
6. Zaimplementować wywołanie `fetch` do wewnętrznego endpointu API, pamiętając o przekazaniu poświadczeń.
7. Zaimplementować obsługę błędów walidacji i błędów API.
8. Po pomyślnym wywołaniu API, zaimplementować przekierowanie na stronę recenzji, używając `generation_id` z odpowiedzi.
9. Dodać link powrotny do `/dashboard`. 