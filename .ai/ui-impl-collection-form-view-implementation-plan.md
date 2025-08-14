# Plan implementacji widoku Formularza Kolekcji (Tworzenie/Edycja)

## 1. Przegląd

Ten widok dostarcza interfejsu do tworzenia nowej kolekcji lub edytowania istniejącej. Składa się z prostego formularza z polami na nazwę i opis kolekcji. Logika jest niemal identyczna dla obu operacji, różniąc się jedynie metodą HTTP wysyłanego żądania i faktem, że przy edycji formularz jest wstępnie wypełniony danymi.

## 2. Routing widoku

- **Tworzenie**: `/dashboard/collections/new`
- **Edycja**: `/dashboard/collections/[id]/edit`

## 3. Struktura komponentów

```
- CollectionFormPage.astro
  - Layout.astro
    - Main
      - Header (H1 "Stwórz nową kolekcję" lub "Edytuj kolekcję")
      - Form (HTML <form>)
        - Card (Shadcn)
          - CardContent
            - Div (dla pola 'name')
              - Label
              - Input
              - p (dla błędu walidacji)
            - Div (dla pola 'description')
              - Label
              - Textarea
          - CardFooter
            - Button (type="submit", "Zapisz zmiany")
```

## 4. Szczegóły komponentów

### `CollectionFormPage.astro`

- **Opis komponentu**: Strona Astro renderowana serwerowo. Obsługuje logikę formularza, w tym pobieranie danych dla trybu edycji, przetwarzanie żądania POST oraz walidację danych.
- **Główne elementy**: `Layout`, standardowy formularz HTML `<form method="POST">`.
- **Logika `---`**:
  - **Dla GET (edycja)**: Pobiera `id` z `Astro.params`. Wywołuje `CollectionsService.getCollectionById()` do pobrania danych kolekcji i przekazania ich do formularza.
  - **Dla POST**:
    1. Pobiera dane z `Astro.request.formData()`.
    2. Waliduje dane używając schemy Zod (`createCollectionSchema` lub `updateCollectionSchema`).
    3. W razie błędów walidacji, renderuje stronę ponownie, przekazując błędy do wyświetlenia przy polach.
    4. Jeśli dane są poprawne, wywołuje odpowiednią metodę serwisu: `CollectionsService.createCollection()` lub `CollectionsService.updateCollection()`.
    5. Po sukcesie, przekierowuje użytkownika do listy kolekcji: `return Astro.redirect('/dashboard/collections')`.

## 5. Typy

- **`CollectionFormViewModel`**: Nowy typ, który będzie reprezentował dane na stronie formularza, włączając w to potencjalne błędy walidacji.
  ```typescript
  interface CollectionFormViewModel {
    values: {
      name: string;
      description: string;
    };
    errors?: {
      name?: string;
      description?: string;
    };
  }
  ```
- **DTO**: `CreateCollectionRequest`, `UpdateCollectionRequest` (używane po stronie serwera do komunikacji z serwisem).

## 6. Zarządzanie stanem

Brak stanu po stronie klienta. Widok jest w pełni kontrolowany przez serwer. Stan formularza (wartości, błędy) jest zarządzany przez cykl żądanie-odpowiedź i przekazywany jako `props` do elementów `value` i wyświetlania błędów.

## 7. Integracja API

Integracja odbywa się w całości po stronie serwera w `---` frontmatter strony Astro.

- **Tworzenie (POST)**: Wywołanie `collectionsService.createCollection(userId, validatedData)`.
- **Edycja (POST)**: Wywołanie `collectionsService.updateCollection(userId, collectionId, validatedData)`.
- **Pobieranie danych (GET, dla edycji)**: Wywołanie `collectionsService.getCollectionById(userId, collectionId)`.

## 8. Interakcje użytkownika

- **Wprowadzanie danych**: Użytkownik wpisuje tekst w polach `Input` i `Textarea`.
- **Wysyłanie formularza**: Użytkownik klika "Zapisz zmiany".
  - **Sukces**: Strona jest przeładowywana, a użytkownik zostaje przekierowany na listę kolekcji.
  - **Błąd walidacji**: Strona jest przeładowywana, a pod niepoprawnymi polami pojawiają się komunikaty o błędach. Wartości w polach zostają zachowane.

## 9. Warunki i walidacja

- **Uwierzytelnienie**: Strony są chronione przez middleware.
- **Walidacja Zod**: Schematy z `src/lib/schemas/collections.schema.ts` są używane w logice POST do walidacji danych.
  - `name`: `string().min(1, 'Nazwa jest wymagana').max(100)`
  - `description`: `string().max(500).optional()`

## 10. Obsługa błędów

- **Błędy walidacji**: Przechwytywane z `zod.safeParse()`. Obiekt błędów jest przekazywany do UI, aby wyświetlić komunikaty przy odpowiednich polach.
- **Błędy serwisu (np. błąd bazy danych)**: Przechwytywane w bloku `try...catch`. Należy wyświetlić ogólny komunikat błędu na stronie (np. w komponencie `Alert`).
- **Błąd pobierania danych (dla edycji)**: Jeśli kolekcja o danym ID nie zostanie znaleziona, należy zwrócić odpowiedź 404.

## 11. Kroki implementacji

1. Stworzyć plik `src/pages/dashboard/collections/new.astro`.
2. Stworzyć plik `src/pages/dashboard/collections/[id]/edit.astro`.
3. Zaimplementować formularz w `new.astro` używając tagu `<form method="POST">` i komponentów Shadcn.
4. W `---` frontmatter w `new.astro`, dodać logikę do obsługi `Astro.request.method === 'POST'`, w tym walidację Zod i wywołanie serwisu.
5. Zaimplementować obsługę błędów walidacji, zachowując wprowadzone przez użytkownika wartości.
6. Skopiować strukturę do `[id]/edit.astro`.
7. W `[id]/edit.astro`, dodać logikę do obsługi `Astro.request.method === 'GET'`, aby pobrać dane kolekcji i wstępnie wypełnić formularz.
8. Zmodyfikować logikę POST w `[id]/edit.astro`, aby wywoływała `updateCollection` zamiast `createCollection`.
9. Dodać przekierowanie do `/dashboard/collections` po pomyślnej operacji w obu plikach.
10. Upewnić się, że obie strony używają `Layout`.
