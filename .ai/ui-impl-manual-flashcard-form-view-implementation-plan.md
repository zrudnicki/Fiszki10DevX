# Plan implementacji widoku Formularza Ręcznego Tworzenia Fiszki

## 1. Przegląd
Ten widok umożliwia użytkownikowi ręczne dodanie pojedynczej fiszki. Jest to prosta alternatywa dla generowania AI, kluczowa dla historyjki użytkownika `US-002`. Formularz zawiera pola na "front", "back" oraz opcjonalne selektory do przypisania fiszki do istniejącej kolekcji i kategorii.

## 2. Routing widoku
- **Ścieżka**: `/dashboard/flashcards/new`

## 3. Struktura komponentów
```
- ManualFlashcardFormPage.astro
  - Layout.astro
    - Main
      - Header (H1 "Stwórz nową fiszkę ręcznie")
      - Form (HTML <form method="POST">)
        - Card
          - CardContent
            - Pole "Front" (Label, Input)
            - Pole "Back" (Label, Textarea)
            - Pole "Kolekcja" (Label, Select)
            - Pole "Kategoria" (Label, Select, opcjonalne)
            - p (dla błędów walidacji)
          - CardFooter
            - Button (type="submit", "Zapisz fiszkę")
```

## 4. Szczegóły komponentów
### `ManualFlashcardFormPage.astro`
- **Opis komponentu**: Strona Astro renderowana serwerowo, która obsługuje formularz tworzenia fiszki.
- **Główne elementy**: `Layout`, `<form method="POST">`, `Input`, `Textarea`, `Select`.
- **Logika `---`**:
  - **Dla GET**: Pobiera listę kolekcji i kategorii użytkownika za pomocą `CollectionsService` i `CategoriesService`, aby wypełnić opcje w selektorach.
  - **Dla POST**:
    1. Pobiera dane z `Astro.request.formData()`.
    2. Waliduje dane używając schemy Zod (`createFlashcardSchema`).
    3. W razie błędów, renderuje stronę ponownie, przekazując błędy i zachowując wprowadzone wartości.
    4. Jeśli dane są poprawne, wywołuje `FlashcardsService.createFlashcard()`.
    5. Po sukcesie, przekierowuje użytkownika do widoku szczegółów kolekcji, do której dodano fiszkę: `return Astro.redirect('/dashboard/collections/' + collectionId)`.

## 5. Typy
- **DTO**: `CreateFlashcardRequest`, `CollectionDTO`, `CategoryDTO`.
- **ViewModel**: `FlashcardFormViewModel` do zarządzania stanem formularza na serwerze.
  ```typescript
  interface FlashcardFormViewModel {
    values: {
      front: string;
      back: string;
      collection_id: string;
      category_id?: string;
    };
    errors?: { /* pola błędów */ };
  }
  ```

## 6. Zarządzanie stanem
Brak stanu po stronie klienta. Widok jest w pełni kontrolowany przez serwer (SSR).

## 7. Integracja API
- **Pobieranie danych (GET)**: W `---` pobierane są listy kolekcji i kategorii do wypełnienia `<select>`.
- **Wysyłanie danych (POST)**: W `---` wywoływany jest `FlashcardsService.createFlashcard(userId, validatedData)`.

## 8. Interakcje użytkownika
- **Wypełnianie formularza**: Użytkownik wpisuje dane i wybiera opcje z list.
- **Wysyłanie**: Użytkownik klika "Zapisz fiszkę".
  - **Sukces**: Przekierowanie do widoku kolekcji.
  - **Błąd**: Przeładowanie strony z widocznymi błędami walidacji.

## 9. Warunki i walidacja
- **Uwierzytelnienie**: Strona chroniona przez middleware.
- **Walidacja Zod**: Logika POST waliduje dane zgodnie ze schemą.
  - `front`: `string().min(1).max(200)`
  - `back`: `string().min(1).max(500)`
  - `collection_id`: `string().uuid('Nie wybrano kolekcji')`

## 10. Obsługa błędów
- **Błędy walidacji**: Obsługiwane przez ponowne renderowanie strony z błędami.
- **Błędy serwisu**: `try...catch` wokół wywołania `createFlashcard`. W razie błędu, wyświetlenie ogólnego komunikatu `Alert`.
- **Błąd pobierania kolekcji/kategorii**: Jeśli pobranie list się nie powiedzie, formularz nie będzie mógł być poprawnie wyświetlony. Należy obsłużyć ten przypadek, np. wyświetlając błąd.

## 11. Kroki implementacji
1. Stworzyć plik `src/pages/dashboard/flashcards/new.astro`.
2. Użyć `Layout`.
3. Zaimplementować formularz HTML z `method="POST"`.
4. W `---`, zaimplementować logikę dla `GET`: pobranie list kolekcji i kategorii i przekazanie ich do `select` w formularzu.
5. W `---`, zaimplementować logikę dla `POST`: walidacja, wywołanie serwisu, obsługa błędów i przekierowanie.
6. Zapewnić, że błędy walidacji są poprawnie wyświetlane przy polach i że wartości w formularzu są zachowywane po błędzie.
7. Upewnić się, że selektor kolekcji jest polem wymaganym.
8. Dodać link powrotny do `/dashboard`. 