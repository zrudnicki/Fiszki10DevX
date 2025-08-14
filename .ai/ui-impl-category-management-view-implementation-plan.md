# Plan implementacji widoków Zarządzania Kategoriami

## 1. Przegląd

Zarządzanie kategoriami jest analogiczne do zarządzania kolekcjami. Składa się z trzech głównych widoków: listy kategorii, formularza tworzenia nowej kategorii i formularza edycji istniejącej. Pozwala to użytkownikom na grupowanie fiszek w dodatkowy sposób. Ze względu na ogromne podobieństwo do widoków kolekcji, implementacja powinna bazować na już istniejących komponentach i logice, dostosowując jedynie typy danych i endpointy.

## 2. Routing widoku

- **Lista**: `/dashboard/categories`
- **Tworzenie**: `/dashboard/categories/new`
- **Edycja**: `/dashboard/categories/[id]/edit`

## 3. Struktura komponentów

Struktura będzie niemal identyczna jak dla kolekcji, z reużyciem layoutu i adaptacją komponentów.

### Widok listy (`/dashboard/categories`)

- `CategoriesListPage.astro`
  - `Layout.astro`
  - `CategoriesList.tsx` (Astro Island)
    - `Table` (Shadcn)
    - `CategoryTableRow.tsx`

### Widoki formularzy (`.../new`, `.../[id]/edit`)

- `CategoryFormPage.astro` (można stworzyć jeden dynamiczny komponent lub dwa osobne pliki `.astro`)
  - `Layout.astro`
  - Formularz HTML `method="POST"`

## 4. Szczegóły komponentów

Implementacja będzie polegać na skopiowaniu i adaptacji komponentów z `src/components/collections` do `src/components/categories`.

- **`CategoriesList.tsx` / `CategoryTableRow.tsx`**: Adaptacja `CollectionsList`. Będzie przyjmować `initialCategories: CategoryDTO[]` i wywoływać `DELETE /api/categories/[id]`.
- **`CategoryFormPage.astro`**: Adaptacja `CollectionFormPage`. Będzie pobierać/wysyłać dane do endpointów kategorii. Walidacja będzie dotyczyła tylko pola `name`.

## 5. Typy

- **DTO**: `CategoryDTO`, `CreateCategoryRequest`, `UpdateCategoryRequest` z `src/types/dto.types.ts`.
- **ViewModel**: `CategoryFormViewModel` dla formularza, zawierający `values: { name: string }` i `errors`.

## 6. Zarządzanie stanem

- **Lista**: Stan kliencki w `CategoriesList.tsx` (`useState`) do zarządzania listą po usunięciu elementu.
- **Formularze**: Brak stanu klienckiego, pełne SSR.

## 7. Integracja API

Wszystkie wywołania będą kierowane do endpointów `/api/categories`.

- **Lista**:
  - GET (SSR): `CategoriesService.getCategories()`
  - DELETE (CSR): `fetch('/api/categories/[id]', { method: 'DELETE' })`
- **Formularze (SSR)**:
  - GET (dla edycji): `CategoriesService.getCategoryById()`
  - POST (tworzenie): `CategoriesService.createCategory()`
  - POST (edycja): `CategoriesService.updateCategory()`

## 8. Interakcje użytkownika

Identyczne jak w przypadku zarządzania kolekcjami (przeglądanie, nawigacja, tworzenie, edycja, usuwanie z potwierdzeniem).

## 9. Warunki i walidacja

- **Uwierzytelnienie**: Chronione przez middleware.
- **Walidacja Zod**: W formularzu POST, walidacja dla pola `name`: `string().min(1).max(50)`. Serwis powinien również sprawdzać unikalność nazwy kategorii dla danego użytkownika.

## 10. Obsługa błędów

Identyczna jak w przypadku zarządzania kolekcjami:

- Błędy pobierania danych na stronach `.astro` powinny skutkować wyświetleniem strony błędu.
- Błędy usuwania po stronie klienta powinny być komunikowane przez "toast".
- Błędy walidacji w formularzach powinny być wyświetlane przy polach.

## 11. Kroki implementacji

1. Stworzyć plik `src/pages/dashboard/categories/index.astro`.
2. Stworzyć plik `src/pages/dashboard/categories/new.astro`.
3. Stworzyć plik `src/pages/dashboard/categories/[id]/edit.astro`.
4. Skopiować i zaadaptować komponenty `CollectionsList.tsx` i `CollectionTableRow.tsx` na `CategoriesList.tsx` i `CategoryTableRow.tsx` w nowym folderze `src/components/categories`. Zmienić typy i endpointy.
5. Zaimplementować logikę w `index.astro` do pobierania i wyświetlania listy kategorii, używając nowo stworzonych komponentów.
6. Zaimplementować logikę w `new.astro` i `[id]/edit.astro` do obsługi formularzy, analogicznie do formularzy kolekcji.
7. Zaktualizować schemę walidacji Zod dla kategorii.
8. Upewnić się, że wszystkie nowe strony używają `Layout` i mają linki powrotne.
9. Przetestować cały cykl CRUD dla kategorii.
