# Plan implementacji widoku Panelu Głównego (Dashboard)

## 1. Przegląd
Panel Główny jest centralnym punktem nawigacyjnym ("hubem") dla zalogowanego użytkownika. Nie wyświetla on złożonych danych, lecz prezentuje w czytelny sposób wszystkie główne sekcje aplikacji w formie klikalnych kart. Jest to pierwsza strona, którą użytkownik widzi po zalogowaniu.

## 2. Routing widoku
- **Ścieżka**: `/dashboard` lub `/dashboard/index`

## 3. Struktura komponentów
```
- DashboardPage.astro
  - DashboardLayout.astro (nowy, współdzielony layout)
    - Header (z np. logo i AuthButton)
    - Main
      - slot (na treść strony)
        - H1 (Tytuł "Witaj w panelu")
        - Grid (Tailwind)
          - CardLink.astro (komponent reużywalny)
          - CardLink.astro
          - ... (jedna karta dla każdej sekcji)
```

## 4. Szczegóły komponentów
### `DashboardPage.astro`
- **Opis komponentu**: Główna strona panelu. Jej zadaniem jest wyświetlenie siatki z linkami do podstron.
- **Główne elementy**: `DashboardLayout`, siatka z komponentami `CardLink`.
- **Propsy**: Brak.

### `DashboardLayout.astro`
- **Opis komponentu**: Nowy, współdzielony layout dla wszystkich stron wewnątrz panelu. Zapewnia spójny nagłówek, stopkę i tło. Zawiera komponent `AuthButton` do wylogowania.
- **Główne elementy**: `<header>`, `<main>`, `<slot />`, `AuthButton`.
- **Propsy**: `title: string` (dla tagu `<title>` strony).

### `CardLink.astro`
- **Opis komponentu**: Reużywalny komponent reprezentujący pojedynczą, klikalną kartę na dashboardzie.
- **Główne elementy**: `<a>` owijający komponent `Card` z Shadcn. Wewnątrz `CardHeader` z ikoną i tytułem oraz `CardDescription` z krótkim opisem.
- **Propsy**:
  - `href: string`
  - `title: string`
  - `description: string`
  - `icon?: Component` (opcjonalna ikona)

## 5. Typy
Nie są wymagane żadne niestandardowe typy.

## 6. Zarządzanie stanem
Ten widok jest w pełni statyczny i nie wymaga zarządzania stanem po stronie klienta.

## 7. Integracja API
Ten widok nie wykonuje żadnych wywołań API do pobierania danych.

## 8. Interakcje użytkownika
- **Nawigacja**: Użytkownik klika na dowolną kartę, co powoduje przejście do odpowiedniej podstrony (np. `/dashboard/collections`).
- **Wylogowanie**: Użytkownik klika na przycisk wylogowania w `AuthButton`, co kończy jego sesję i przekierowuje na stronę logowania.

## 9. Warunki i walidacja
- **Warunek**: Widok musi być chroniony i dostępny tylko dla zalogowanych użytkowników. Jest to realizowane przez middleware, które weryfikuje sesję Supabase. Jeśli użytkownik nie jest zalogowany, zostaje przekierowany na `/`.

## 10. Obsługa błędów
Ponieważ widok jest statyczny i nie wchodzi w interakcje z API, jedyny potencjalny błąd to brak autoryzacji, który jest obsługiwany przez przekierowanie w middleware.

## 11. Kroki implementacji
1. **Refaktoryzacja layoutu bazowego**: Zmienić nazwę pliku `src/layouts/Layout.astro` na `src/layouts/BaseLayout.astro`. Upewnić się, że zawiera on tylko absolutne podstawy (`<html>`, `<head>`, `<body>`, `<slot/>`) i globalne style, bez specyficznych elementów nawigacyjnych. Zaktualizować istniejące strony (np. `index.astro`), aby używały nowego `BaseLayout.astro`.
2. **Stworzenie `DashboardLayout.astro`**: Stworzyć nowy plik `src/layouts/DashboardLayout.astro`. Wewnątrz niego zaimportować i użyć `BaseLayout`. Dodać do niego strukturę wspólną dla panelu, np. `<header>` z logo i komponentem `<AuthButton client:load />` oraz `<main>` zawierający `<slot />`.
3. **Stworzenie komponentu `CardLink`**: Stworzyć reużywalny komponent `src/components/dashboard/CardLink.astro`, który będzie przyjmował `href`, `title` i `description` jako propsy.
4. **Stworzenie strony panelu**: Stworzyć stronę `src/pages/dashboard/index.astro`.
5. **Implementacja widoku**: Na stronie `dashboard/index.astro` użyć `DashboardLayout`. Wewnątrz zaimplementować siatkę (np. `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`) i umieścić w niej instancje komponentu `CardLink` dla każdej z głównych sekcji aplikacji:
   - Zarządzanie Kolekcjami (`/dashboard/collections`)
   - Zarządzanie Kategoriami (`/dashboard/categories`)
   - Sesja Nauki (`/dashboard/study/session`)
   - Generowanie AI (`/dashboard/ai/generate`)
   - Tworzenie Ręczne (`/dashboard/flashcards/new`)
   - Statystyki (`/dashboard/stats`)
   - Ustawienia Konta (`/dashboard/account`)
6. **Weryfikacja Middleware**: Zapewnić, że middleware (`src/middleware/index.ts`) poprawnie chroni ścieżkę `/dashboard` i wszystkie jej podścieżki, przekierowując niezalogowanych użytkowników. 