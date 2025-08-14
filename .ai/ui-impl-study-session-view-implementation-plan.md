# Plan implementacji widoku Sesji Nauki

## 1. Przegląd
Widok Sesji Nauki jest kluczowym elementem aplikacji, gdzie odbywa się faktyczna nauka. Zgodnie z decyzjami, widok ten wyświetla jednocześnie 10 fiszek. Użytkownik ma za zadanie ocenić swoją znajomość każdej z nich. Po zakończeniu sesji, wszystkie odpowiedzi są wysyłane do serwera w jednym żądaniu.

## 2. Routing widoku
- **Główny widok**: `/dashboard/study/session`
- **Strona podsumowania**: `/dashboard/study/complete` (chociaż może być to ta sama strona z warunkowym renderowaniem)

## 3. Struktura komponentów
```
- StudySessionPage.astro
  - Layout.astro
    - Main
      - Header (H1 "Sesja Nauki", ew. nazwa kolekcji)
      - StudySessionForm.tsx (Astro Island, client:load)
        - Form (HTML <form>)
          - Div (mapa po fiszkach)
            - StudyFlashcard.tsx (dla każdej fiszki)
              - Card
                - CardContent (wyświetla "Front")
                - CardFooter (przycisk "Pokaż odpowiedź")
                - if (odpowiedź pokazana)
                  - Div (wyświetla "Back")
                  - Div (grupa przycisków oceny: "Źle", "Dobrze", "Idealnie")
          - Footer
            - Button (type="submit", "Zakończ sesję")
```

## 4. Szczegóły komponentów
### `StudySessionPage.astro`
- **Opis komponentu**: Strona Astro, która inicjuje sesję nauki.
- **Główne elementy**: `Layout`, `StudySessionForm`.
- **Logika `---`**:
  - Wywołuje endpoint `GET /api/study/next?limit=10` (lub odpowiedni serwis), aby pobrać listę 10 fiszek do nauki.
  - Przekazuje pobraną listę fiszek jako `prop` do `StudySessionForm`.

### `StudySessionForm.tsx`
- **Opis komponentu**: Interaktywny komponent React, który zarządza całą sesją nauki.
- **Główne elementy**: Formularz, lista komponentów `StudyFlashcard`.
- **Propsy**: `flashcards: NextFlashcardDTO[]`, `sessionId: string`.

### `StudyFlashcard.tsx`
- **Opis komponentu**: Reprezentuje pojedynczą fiszkę w sesji. Zarządza swoim stanem (czy odpowiedź jest pokazana) i przekazuje ocenę w górę.
- **Główne elementy**: `Card`, `Button`.
- **Obsługiwane interakcje**:
  - Kliknięcie "Pokaż odpowiedź" -> odsłania `back`.
  - Kliknięcie przycisku oceny -> wywołuje `onReview`.
- **Propsy**: `flashcard: NextFlashcardDTO`, `onReview: (flashcardId: string, quality: number) => void`.

## 5. Typy
- **DTO**: `NextFlashcardDTO`, `BatchReviewRequest`, `ReviewFlashcardRequest`.
- **ViewModel**: Wewnątrz `StudySessionForm.tsx` potrzebny będzie stan do przechowywania ocen.
  ```typescript
  // Mapa, gdzie klucz to ID fiszki, a wartość to ocena (quality)
  type ReviewsState = Record<string, number>;
  ```

## 6. Zarządzanie stanem
- Stan jest zarządzany wewnątrz `StudySessionForm.tsx`.
- Wymagany stan (`useState`):
  - `reviews: ReviewsState` - obiekt przechowujący oceny użytkownika dla każdej fiszki.
  - `isSubmitting: boolean` - do obsługi stanu ładowania przycisku "Zakończ sesję".

## 7. Integracja API
- **Pobieranie danych (GET)**: W `---` strony `.astro` pobierana jest lista fiszek z `/api/study/next`.
- **Wysyłanie danych (POST)**:
  - W `StudySessionForm.tsx`, po wysłaniu formularza, stan `reviews` jest transformowany w ciało żądania.
  - Wywołanie: `fetch('/api/study/sessions/' + sessionId + '/review', { method: 'POST', body: ... })`.
  - **Typ żądania**: `BatchReviewRequest`, które zawiera `reviews: ReviewFlashcardRequest[]`.
  - **Typ odpowiedzi**: `200 OK` z podsumowaniem.

## 8. Interakcje użytkownika
- **Odsłanianie odpowiedzi**: Użytkownik klika "Pokaż odpowiedź" na poszczególnych fiszkach.
- **Ocenianie**: Użytkownik klika jeden z przycisków oceny, co zapisuje jego odpowiedź w stanie formularza.
- **Zakończenie sesji**: Użytkownik klika "Zakończ sesję".
  - **Sukces**: Zostaje przekierowany na stronę podsumowania (`/dashboard/study/complete`) z gratulacjami i opcjami dalszych działań.
  - **Błąd**: Wyświetlany jest komunikat o błędzie.

## 9. Warunki i walidacja
- **Warunek**: Przycisk "Zakończ sesję" powinien być nieaktywny (`disabled`), dopóki użytkownik nie oceni wszystkich 10 fiszek.
- **Walidacja**: Przed wysłaniem należy sprawdzić, czy obiekt `reviews` zawiera wpisy dla wszystkich fiszek z sesji.

## 10. Obsługa błędów
- **Błąd pobierania fiszek (SSR)**: Jeśli nie uda się pobrać fiszek do sesji, strona `.astro` powinna wyświetlić komunikat, np. "Brak fiszek do powtórki. Wróć później!" wraz z linkiem do dashboardu.
- **Błąd wysyłania ocen (CSR)**: Jeśli `fetch` do zapisu recenzji zwróci błąd, należy wyświetlić `Alert` z informacją o niepowodzeniu zapisu sesji.

## 11. Kroki implementacji
1. Stworzyć plik `src/pages/dashboard/study/session.astro`.
2. W `---` zaimplementować pobieranie listy fiszek z serwisu lub API.
3. Stworzyć komponenty-wyspy `src/components/study/StudySessionForm.tsx` i `src/components/study/StudyFlashcard.tsx`.
4. Przekazać listę fiszek do `StudySessionForm` jako `prop`.
5. W `StudySessionForm` zaimplementować zarządzanie stanem ocen (`reviews`).
6. W `StudyFlashcard` zaimplementować logikę pokazywania odpowiedzi i przekazywania oceny do rodzica.
7. Zaimplementować logikę `onSubmit` w `StudySessionForm`, która waliduje, czy wszystkie fiszki zostały ocenione, a następnie tworzy i wysyła żądanie `fetch`.
8. Zaimplementować przekierowanie na stronę `/dashboard/study/complete` po udanej sesji.
9. Stworzyć prostą, statyczną stronę podsumowania `src/pages/dashboard/study/complete.astro` z gratulacjami i dwoma linkami ("Następna sesja", "Wróć do panelu").
10. Dodać obsługę błędów i stanów `disabled`. 