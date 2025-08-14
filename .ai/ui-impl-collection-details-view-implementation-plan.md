# Plan implementacji widoku Szczegółów Kolekcji

## 1. Przegląd

Ten widok pełni rolę strony szczegółowej dla pojedynczej kolekcji. Wyświetla jej podstawowe informacje (nazwa, opis) oraz, co najważniejsze, listę wszystkich fiszek należących do tej kolekcji. Umożliwia użytkownikowi zarządzanie tymi fiszkami poprzez udostępnienie opcji edycji i usuwania dla każdej z nich.

## 2. Routing widoku

- **Ścieżka**: `/dashboard/collections/[id]`

## 3. Struktura komponentów

```
- CollectionDetailsPage.astro
  - Layout.astro
    - Main
      - HeaderSekcji (H1 "Nazwa Kolekcji", Button "Edytuj kolekcję")
      - p (Opis kolekcji)
      - FlashcardsList.tsx (Astro Island, client:load)
        - Table (Shadcn)
          - TableHeader ("Front", "Back", "Akcje")
          - TableBody
            - FlashcardTableRow.tsx (dla każdej fiszki)
              - TableCell (skrócony tekst frontu)
              - TableCell (skrócony tekst tyłu)
              - TableCell (przyciski "Edytuj", "Usuń")
```

## 4. Szczegóły komponentów

### `CollectionDetailsPage.astro`

- **Opis komponentu**: Strona Astro renderowana serwerowo. Pobiera dane o kolekcji oraz listę powiązanych z nią fiszek.
- **Główne elementy**: `Layout`, `FlashcardsList`.
- **Logika `---`**:
  - Pobiera `id` kolekcji z `Astro.params`.
  - Wywołuje `CollectionsService.getCollectionById()` do pobrania szczegółów kolekcji.
  - Wywołuje `FlashcardsService.getFlashcards({ collection_id: id, ... })` do pobrania listy fiszek.
  - Przekazuje pobrane dane do komponentu `FlashcardsList` jako propsy.
- **Propsy**: Brak.

### `FlashcardsList.tsx`

- **Opis komponentu**: Interaktywna lista fiszek. Działa analogicznie do `CollectionsList`, zarządzając stanem listy fiszek po stronie klienta.
- **Główne elementy**: `Table`. Renderuje komponenty `FlashcardTableRow`.
- **Propsy**: `initialFlashcards: FlashcardDTO[]`.

### `FlashcardTableRow.tsx`

- **Opis komponentu**: Reprezentuje pojedynczą fiszkę w tabeli. Obsługuje logikę usuwania.
- **Główne elementy**: `TableRow`, `TableCell`, `Button`, `AlertDialog`.
- **Obsługiwane interakcje**:
  - Kliknięcie "Usuń" -> otwiera `AlertDialog`.
  - Potwierdzenie -> wywołuje `onDelete`.
  - Kliknięcie "Edytuj" -> nawiguje do `/dashboard/flashcards/[id]/edit`.
- **Propsy**: `flashcard: FlashcardDTO`, `onDelete: (id: string) => void`.

## 5. Typy

- **DTO**: `CollectionDTO`, `FlashcardDTO` z `src/types/dto.types.ts`.
- Nie są wymagane żadne nowe typy.

## 6. Zarządzanie stanem

- Stan jest zarządzany analogicznie do widoku listy kolekcji.
- Dane są pobierane na serwerze i przekazywane jako `props` (`initialFlashcards`).
- Komponent `FlashcardsList.tsx` przechowuje listę fiszek w lokalnym stanie `useState` i aktualizuje ją po pomyślnym usunięciu fiszki, aby uniknąć przeładowania strony.

## 7. Integracja API

- **Pobieranie danych (GET)**:
  - Odbywa się w `---` na stronie `.astro`.
  - Wywołania do `CollectionsService` i `FlashcardsService`.
  - **Typy odpowiedzi**: `CollectionDTO`, `FlashcardsListResponse`.
- **Usuwanie fiszki (DELETE)**:
  - Odbywa się po stronie klienta w `FlashcardTableRow.tsx`.
  - Wywołanie: `fetch('/api/flashcards/' + flashcardId, { method: 'DELETE' })`.
  - **Typ odpowiedzi**: `204 No Content`.

## 8. Interakcje użytkownika

- **Przeglądanie**: Użytkownik widzi szczegóły kolekcji i listę fiszek.
- **Inicjacja edycji fiszki**: Kliknięcie "Edytuj" przenosi na stronę formularza edycji fiszki.
- **Usuwanie fiszki**: Kliknięcie "Usuń", potwierdzenie w modalu, co usuwa fiszkę z listy i z bazy danych.
- **Nawigacja do edycji kolekcji**: Kliknięcie przycisku "Edytuj kolekcję" w nagłówku przenosi do `/dashboard/collections/[id]/edit`.

## 9. Warunki i walidacja

- **Uwierzytelnienie i autoryzacja**: Strona chroniona przez middleware. Logika serwerowa i API muszą zapewnić, że użytkownik ma dostęp tylko do swoich zasobów.
- Jeśli kolekcja o danym `id` nie istnieje lub nie należy do użytkownika, strona powinna zwrócić 404.

## 10. Obsługa błędów

- **Błąd pobierania danych (SSR)**: Jeśli którykolwiek z serwisów zwróci błąd, strona powinna wyświetlić ogólny komunikat błędu.
- **Błąd usuwania (CSR)**: Błąd w `fetch` powinien skutkować wyświetleniem powiadomienia "toast", bez usuwania elementu z UI.

## 11. Kroki implementacji

1. Stworzyć plik `src/pages/dashboard/collections/[id]/index.astro`.
2. W `---` zaimplementować pobieranie szczegółów kolekcji i listy fiszek, obsługując przypadki błędów i 404.
3. Stworzyć komponenty-wyspy `src/components/flashcards/FlashcardsList.tsx` i `src/components/flashcards/FlashcardTableRow.tsx`.
4. Na stronie `.astro` przekazać pobrane dane do komponentu `FlashcardsList`.
5. Zaimplementować w komponentach React logikę tabeli, stanu lokalnego i usuwania (wraz z `AlertDialog`), analogicznie do listy kolekcji.
6. Dodać linki do edycji kolekcji i edycji poszczególnych fiszek.
7. Upewnić się, że strona używa `Layout`.
8. Dodać obsługę paginacji dla listy fiszek, jeśli jest wymagana (przekazując meta dane paginacji i renderując komponent paginacji).
