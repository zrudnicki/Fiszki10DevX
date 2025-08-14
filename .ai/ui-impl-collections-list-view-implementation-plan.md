# Plan implementacji widoku Listy Kolekcji

## 1. Przegląd
Ten widok jest głównym miejscem do zarządzania kolekcjami fiszek. Użytkownik może tu zobaczyć wszystkie swoje kolekcje, nawigować do ich szczegółów, edycji, a także zainicjować proces tworzenia nowej kolekcji lub usunięcia istniejącej. Widok musi również obsłużyć stan, w którym użytkownik nie ma jeszcze żadnych kolekcji.

## 2. Routing widoku
- **Ścieżka**: `/dashboard/collections`

## 3. Struktura komponentów
```
- CollectionsListPage.astro
  - Layout.astro
    - Header
    - Main
      - HeaderSekcji (H1 "Twoje Kolekcje", Button "Dodaj nową")
      - if (collections.length > 0)
        - CollectionsList.tsx (Astro Island, client:load)
          - Table (Shadcn)
            - TableHeader
            - TableBody
              - CollectionTableRow.tsx (dla każdej kolekcji)
                - TableCell (Nazwa, Liczba fiszek)
                - TableCell (Przyciski akcji: Edytuj, Usuń)
      - else
        - EmptyState.astro (Karta z informacją i przyciskiem "Stwórz pierwszą")
```

## 4. Szczegóły komponentów
### `CollectionsListPage.astro`
- **Opis komponentu**: Strona Astro renderowana serwerowo. Odpowiada za pobranie danych o kolekcjach i warunkowe renderowanie listy lub stanu pustego.
- **Główne elementy**: `Layout`, `CollectionsList`, `EmptyState`, `Button` (jako link `<a>`).
- **Propsy**: Brak.

### `CollectionsList.tsx`
- **Opis komponentu**: Interaktywna lista kolekcji. Renderuje tabelę i zarządza stanem listy po stronie klienta (na potrzeby usuwania bez przeładowania strony).
- **Główne elementy**: `Table` z Shadcn. Mapuje dane i renderuje wiersze `CollectionTableRow`.
- **Propsy**: `initialCollections: CollectionDTO[]`.

### `CollectionTableRow.tsx`
- **Opis komponentu**: Komponent reprezentujący pojedynczy wiersz w tabeli kolekcji. Zawiera logikę do obsługi akcji na danym wierszu.
- **Główne elementy**: `TableRow`, `TableCell`, `Button` (dla akcji), `AlertDialog` (do potwierdzenia usunięcia).
- **Obsługiwane interakcje**:
  - Kliknięcie "Usuń" -> otwiera `AlertDialog`.
  - Potwierdzenie w `AlertDialog` -> wywołuje `onDelete`.
- **Typy**: `CollectionDTO`.
- **Propsy**: `collection: CollectionDTO`, `onDelete: (id: string) => void`.

### `EmptyState.astro`
- **Opis komponentu**: Statyczny komponent wyświetlany, gdy brak kolekcji.
- **Główne elementy**: `Card` z tytułem, opisem i przyciskiem-linkiem do `/dashboard/collections/new`.
- **Propsy**: Brak.

## 5. Typy
- **`CollectionDTO`**: Używany do przekazywania danych kolekcji. Interfejs jest już zdefiniowany w `src/types/dto.types.ts`.
- Nie są wymagane żadne nowe, niestandardowe typy.

## 6. Zarządzanie stanem
- **SSR**: Dane są pobierane jednorazowo po stronie serwera w `CollectionsListPage.astro`.
- **CSR**: Komponent `CollectionsList.tsx` otrzyma początkową listę jako `props`.
  - `const [collections, setCollections] = useState(initialCollections);`
- **Aktualizacja po usunięciu**: Funkcja `handleDelete` w `CollectionsList.tsx` usunie element z lokalnego stanu `collections`, co spowoduje ponowne renderowanie tabeli bez przeładowania strony.
  - `setCollections(currentCollections => currentCollections.filter(c => c.id !== idToDelete));`

## 7. Integracja API
- **Pobieranie listy (GET)**:
  - Odbywa się w `---` frontmatter strony `CollectionsListPage.astro`.
  - Zamiast `fetch`, należy bezpośrednio użyć usługi: `new CollectionsService(Astro.locals.supabase).getCollections(userId, { limit: 50, offset: 0, ... })`.
  - **Typ odpowiedzi**: `CollectionsListResponse`.
- **Usuwanie (DELETE)**:
  - Odbywa się po stronie klienta w `CollectionTableRow.tsx`.
  - Wywołanie: `fetch('/api/collections/' + collectionId, { method: 'DELETE' })`.
  - **Typ odpowiedzi**: `204 No Content`.

## 8. Interakcje użytkownika
- **Przeglądanie**: Użytkownik widzi listę swoich kolekcji.
- **Nawigacja do szczegółów**: Kliknięcie nazwy kolekcji przenosi do `/dashboard/collections/[id]`.
- **Inicjacja tworzenia**: Kliknięcie "Dodaj nową" przenosi do `/dashboard/collections/new`.
- **Inicjacja edycji**: Kliknięcie "Edytuj" w wierszu przenosi do `/dashboard/collections/[id]/edit`.
- **Usuwanie**: Kliknięcie "Usuń" -> otwarcie modala -> potwierdzenie -> usunięcie elementu z listy i z bazy danych.

## 9. Warunki i walidacja
- **Uwierzytelnienie**: Strona jest chroniona przez middleware.
- **Autoryzacja**: API i logika serwerowa zapewniają, że użytkownik widzi i może modyfikować tylko swoje kolekcje.

## 10. Obsługa błędów
- **Błąd pobierania (SSR)**: Jeśli `CollectionsService` zwróci błąd, strona `CollectionsListPage.astro` powinna wyrenderować stronę błędu (np. z komunikatem "Nie udało się załadować kolekcji").
- **Błąd usuwania (CSR)**: Jeśli `fetch` dla `DELETE` zwróci błąd, należy wyświetlić powiadomienie "toast" (np. przy użyciu Sonner) z komunikatem "Nie udało się usunąć kolekcji". Element nie powinien być usuwany z lokalnego stanu, aby UI pozostało spójne z backendem.

## 11. Kroki implementacji
1. Stworzyć plik `src/pages/dashboard/collections/index.astro`.
2. W `---` zaimplementować pobieranie danych kolekcji przez `CollectionsService`, dbając o obsługę błędów (try-catch).
3. Stworzyć komponent `src/components/collections/EmptyState.astro`.
4. Stworzyć komponent-wyspę `src/components/collections/CollectionTableRow.tsx` i `src/components/collections/CollectionsList.tsx`.
5. W `CollectionsListPage.astro` zaimplementować logikę warunkową do renderowania `CollectionsList` lub `EmptyState`.
6. W `CollectionsList.tsx` zarządzać stanem listy i przekazać funkcję do usuwania jako `prop` do `CollectionTableRow.tsx`.
7. W `CollectionTableRow.tsx` zaimplementować logikę przycisku usuwania, w tym `AlertDialog` i wywołanie `fetch`.
8. Dodać obsługę błędów dla operacji `DELETE` (np. Sonner/toast).
9. Dodać wszystkie niezbędne linki nawigacyjne (`<a>`).
10. Ostylować komponenty zgodnie z systemem designu. 