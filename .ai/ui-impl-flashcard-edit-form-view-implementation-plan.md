# Plan implementacji widoku Formularza Edycji Fiszki

## 1. Przegląd
Ten widok pozwala na realizację historyjki użytkownika `US-003`, dając możliwość edycji pól "front" i "back" istniejącej fiszki. Jest to standardowy formularz, który będzie wstępnie wypełniony danymi fiszki. Jego implementacja będzie bardzo podobna do formularza tworzenia kolekcji w trybie edycji.

## 2. Routing widoku
- **Ścieżka**: `/dashboard/flashcards/[id]/edit`

## 3. Struktura komponentów
```
- FlashcardEditPage.astro
  - DashboardLayout.astro
    - Main
      - Header (H1 "Edytuj fiszkę")
      - Form (HTML <form method="POST">)
        - Card
          - CardContent
            - Pole "Front" (Label, Input)
            - Pole "Back" (Label, Textarea)
            - ... (opcjonalnie pola kolekcji/kategorii)
            - p (dla błędów walidacji)
          - CardFooter
            - Button (type="submit", "Zapisz zmiany")
```

## 4. Szczegóły komponentów
### `FlashcardEditPage.astro`
- **Opis komponentu**: Strona Astro renderowana serwerowo, która obsługuje cały proces edycji.
- **Główne elementy**: `DashboardLayout`, `<form method="POST">`.
- **Logika `---`**:
  - **Dla GET**:
    1. Pobiera `id` fiszki z `Astro.params`.
    2. Wywołuje `FlashcardsService.getFlashcardById()` aby pobrać dane fiszki.
    3. (Opcjonalnie) Pobiera listy kolekcji i kategorii, jeśli chcemy pozwolić na ich zmianę.
    4. Renderuje formularz, wstępnie wypełniając go pobranymi danymi.
  - **Dla POST**:
    1. Pobiera dane z `Astro.request.formData()`.
    2. Waliduje dane używając schemy Zod (`updateFlashcardSchema`).
    3. W razie błędów, renderuje stronę ponownie z błędami.
    4. Jeśli dane są poprawne, wywołuje `FlashcardsService.updateFlashcard()`.
    5. Po sukcesie, przekierowuje użytkownika z powrotem do widoku szczegółów kolekcji, z której pochodziła fiszka.

## 5. Typy
- **DTO**: `FlashcardDTO`, `UpdateFlashcardRequest`.
- **ViewModel**: `FlashcardFormViewModel`, taki sam jak przy tworzeniu ręcznym, do obsługi wartości i błędów formularza na serwerze.

## 6. Zarządzanie stanem
Brak stanu po stronie klienta. Widok w pełni kontrolowany przez serwer (SSR).

## 7. Integracja API
- Integracja odbywa się po stronie serwera w `---` frontmatter.
- **Pobieranie danych (GET)**: Wywołanie `flashcardsService.getFlashcardById(userId, flashcardId)`.
- **Wysyłanie danych (POST)**: Wywołanie `flashcardsService.updateFlashcard(userId, flashcardId, validatedData)`.

## 8. Interakcje użytkownika
- **Modyfikacja**: Użytkownik zmienia treść w polach `Input` i `Textarea`.
- **Zapis**: Użytkownik klika "Zapisz zmiany".
  - **Sukces**: Przekierowanie do widoku szczegółów kolekcji (`/dashboard/collections/[id]`).
  - **Błąd**: Przeładowanie strony z widocznymi błędami walidacji.

## 9. Warunki i walidacja
- **Uwierzytelnienie**: Strona chroniona przez middleware.
- **Autoryzacja**: Serwis musi zapewnić, że użytkownik może edytować tylko własną fiszkę.
- **Walidacja Zod**: Logika POST waliduje `front` i `back` zgodnie z ograniczeniami znaków (max 200 dla frontu, max 500 dla tyłu).

## 10. Obsługa błędów
- **Błąd pobierania danych**: Jeśli fiszka nie istnieje lub nie należy do użytkownika, strona powinna zwrócić 404.
- **Błędy walidacji**: Obsługiwane przez ponowne renderowanie strony z komunikatami o błędach.
- **Błędy serwisu**: `try...catch` wokół wywołania `updateFlashcard` i wyświetlenie ogólnego komunikatu `Alert`.

## 11. Kroki implementacji
1. Stworzyć plik `src/pages/dashboard/flashcards/[id]/edit.astro`.
2. Użyć `DashboardLayout`.
3. Zaimplementować formularz HTML z `method="POST"`.
4. W `---`, zaimplementować logikę dla `GET`: pobranie danych fiszki i wypełnienie formularza.
5. W `---`, zaimplementować logikę dla `POST`: walidacja, wywołanie serwisu, obsługa błędów i przekierowanie.
6. Aby zrealizować przekierowanie z powrotem do kolekcji, po udanej edycji należy pobrać `collection_id` ze zaktualizowanej fiszki i użyć go w `Astro.redirect`.
7. Zapewnić, że błędy walidacji są poprawnie obsługiwane.
8. Dodać link powrotny do widoku kolekcji, z której użytkownik przyszedł. Można to zrealizować, dodając `?redirect_url=...` do linku edycji lub po prostu wracając do strony kolekcji na podstawie `collection_id`. 