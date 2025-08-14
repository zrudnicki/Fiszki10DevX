# Plan implementacji widoku Recenzji Fiszek AI

## 1. Przegląd
Ten widok jest drugim i ostatnim krokiem w procesie generowania fiszek AI. Użytkownik widzi tutaj listę fiszek-kandydatów i może zdecydować, które z nich chce zaakceptować. Może również edytować treść każdej fiszki przed ostatecznym zapisem. Kluczowym elementem jest obowiązek wybrania kolekcji, do której trafią zaakceptowane fiszki.

## 2. Routing widoku
- **Ścieżka**: `/dashboard/ai/review/[generationId]`

## 3. Struktura komponentów
```
- AIReviewPage.astro
  - Layout.astro
    - Main
      - Header (H1 "Zrecenzuj wygenerowane fiszki")
      - AIReviewForm.tsx (Astro Island, client:load)
        - Form (HTML <form>)
          - Div (nagłówek formularza)
            - Label ("Zapisz do kolekcji:")
            - Select (do wyboru kolekcji)
            - p (dla błędu walidacji wyboru kolekcji)
          - Div (lista fiszek)
            - FlashcardCandidateCard.tsx (dla każdej fiszki)
              - Checkbox (do akceptacji)
              - Input (dla "Front", edytowalny)
              - Textarea (dla "Back", edytowalna)
          - Footer
            - Button (type="submit", "Zapisz zaakceptowane")
```

## 4. Szczegóły komponentów
### `AIReviewPage.astro`
- **Opis komponentu**: Strona Astro renderowana serwerowo. Pobiera listę kandydatów fiszek oraz listę dostępnych kolekcji użytkownika.
- **Główne elementy**: `Layout`, `AIReviewForm`.
- **Logika `---`**:
  - Pobiera `generationId` z `Astro.params`.
  - Wywołuje API (lub logikę z tymczasowego хранилища), aby pobrać kandydatów powiązanych z `generationId`.
  - Wywołuje `CollectionsService.getCollections()` aby pobrać listę kolekcji użytkownika dla selektora.
  - Przekazuje obie listy jako propsy do `AIReviewForm`.

### `AIReviewForm.tsx`
- **Opis komponentu**: Duży, interaktywny formularz React, który zarządza całym procesem recenzji po stronie klienta.
- **Główne elementy**: `<form>`, `Select`, `Button`, lista komponentów `FlashcardCandidateCard`.
- **Obsługiwane interakcje**:
  - Wybór kolekcji z listy.
  - Zaznaczanie/odznaczanie checkboxów akceptacji.
  - Edycja treści w polach "Front" i "Back".
  - Wysłanie formularza.
- **Propsy**: `candidates: FlashcardCandidate[]`, `collections: CollectionDTO[]`.

### `FlashcardCandidateCard.tsx`
- **Opis komponentu**: Reprezentuje pojedynczą fiszkę-kandydata na liście.
- **Główne elementy**: `Card`, `Checkbox`, `Input`, `Textarea`.
- **Propsy**: `candidate: FlashcardCandidate`, `index: number`, `onUpdate: (index, field, value) => void`, `onToggle: (index) => void`.

## 5. Typy
- **DTO**: `FlashcardCandidate`, `CollectionDTO`, `AcceptFlashcardsRequest`.
- **ViewModel**: `ReviewedFlashcardViewModel`. Komponent `AIReviewForm.tsx` będzie zarządzał tablicą takich obiektów w swoim stanie.
  ```typescript
  interface ReviewedFlashcardViewModel {
    front: string;
    back: string;
    originalFront: string; // do porównania, czy była edycja
    originalBack: string;
    accepted: boolean;
  }
  ```

## 6. Zarządzanie stanem
- Stan jest w pełni zarządzany po stronie klienta wewnątrz komponentu `AIReviewForm.tsx`.
- Wymagany stan (`useState`):
  - `reviewedFlashcards: ReviewedFlashcardViewModel[]` - główna lista fiszek, którą użytkownik modyfikuje.
  - `selectedCollection: string | null` - ID wybranej kolekcji.
  - `errors: { collection?: string }` - błędy walidacji.

## 7. Integracja API
- **Pobieranie danych (GET)**: W `---` strony `.astro` pobierane są dane kandydatów i kolekcji.
- **Wysyłanie danych (POST)**:
  - W `AIReviewForm.tsx`, po wysłaniu formularza, następuje transformacja stanu `ReviewedFlashcardViewModel[]` na ciało żądania.
  - Wywołanie: `fetch('/api/generate/flashcards/' + generationId + '/accept', { method: 'POST', body: ... })`.
  - **Typ żądania**: `AcceptFlashcardsRequest`. Ciało będzie zawierać `collection_id` oraz listę `accepted_cards`, gdzie każdy obiekt ma `front`, `back` i `edited: boolean`.
  - **Typ odpowiedzi**: `AcceptFlashcardsResponse`.

## 8. Interakcje użytkownika
- **Recenzja**: Użytkownik przegląda listę, zaznacza checkboxami fiszki, które chce zapisać, i edytuje ich treść w razie potrzeby.
- **Wybór kolekcji**: Użytkownik musi wybrać kolekcję z listy `Select`.
- **Zapis**: Użytkownik klika "Zapisz zaakceptowane".
  - **Sukces**: Użytkownik jest przekierowywany do widoku szczegółów wybranej kolekcji (`/dashboard/collections/[id]`).
  - **Błąd**: Wyświetlany jest komunikat błędu (np. jeśli nie wybrano kolekcji).

## 9. Warunki i walidacja
- **Warunek**: Przycisk "Zapisz zaakceptowane" powinien być nieaktywny (`disabled`), dopóki użytkownik nie wybierze kolekcji i nie zaakceptuje co najmniej jednej fiszki.
- **Walidacja**: Przed wysłaniem formularza należy sprawdzić, czy `selectedCollection` nie jest `null`. Jeśli jest, należy wyświetlić błąd przy selektorze.

## 10. Obsługa błędów
- **Błąd pobierania danych (SSR)**: Jeśli na stronie `.astro` nie uda się pobrać kandydatów lub kolekcji, należy wyświetlić stronę błędu.
- **Błąd walidacji (CSR)**: Wyświetlenie komunikatu o błędzie przy selektorze kolekcji.
- **Błąd API (CSR)**: Jeśli `fetch` do endpointu akceptacji zwróci błąd, należy wyświetlić ogólny `Alert` z informacją o niepowodzeniu zapisu.

## 11. Kroki implementacji
1. Stworzyć plik `src/pages/dashboard/ai/review/[generationId].astro`.
2. W `---` zaimplementować pobieranie danych kandydatów i listy kolekcji.
3. Stworzyć komponent-wyspę `src/components/ai/AIReviewForm.tsx` oraz jego komponent-dziecko `FlashcardCandidateCard.tsx`.
4. Przekazać pobrane dane jako propsy do `AIReviewForm`.
5. W `AIReviewForm` zaimplementować logikę zarządzania stanem (lista fiszek, wybrana kolekcja, błędy).
6. Zaimplementować logikę `onSubmit`, która waliduje dane, transformuje je do formatu `AcceptFlashcardsRequest` i wysyła żądanie `fetch`.
7. Dodać obsługę przekierowania po udanej operacji.
8. Zaimplementować logikę `disabled` dla przycisku zapisu.
9. Dodać obsługę błędów walidacji i błędów API.
10. Użyć `Layout` i dodać link powrotny do `/dashboard`. 