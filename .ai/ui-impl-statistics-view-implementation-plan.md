# Plan implementacji widoku Statystyk

## 1. Przegląd
Widok statystyk ma na celu dostarczenie użytkownikowi wglądu w jego postępy w nauce oraz efektywność generowania fiszek przez AI. Zgodnie z decyzjami, widok ten będzie prezentował dane w prosty i czytelny sposób, używając kart z liczbami, bez skomplikowanych wykresów.

## 2. Routing widoku
- **Ścieżka**: `/dashboard/stats`

## 3. Struktura komponentów
```
- StatsPage.astro
  - DashboardLayout.astro
    - Main
      - Header (H1 "Twoje Statystyki")
      - Grid (Tailwind, np. grid-cols-2 lub 3)
        - Sekcja "Statystyki Nauki" (H2)
          - StatCard.astro (dla "Całkowita liczba fiszek")
          - StatCard.astro (dla "Liczba recenzji")
          - StatCard.astro (dla "Skuteczność")
        - Sekcja "Statystyki Generowania AI" (H2)
          - StatCard.astro (dla "Współczynnik akceptacji")
          - StatCard.astro (dla "Współczynnik edycji")
```

## 4. Szczegóły komponentów
### `StatsPage.astro`
- **Opis komponentu**: Strona Astro renderowana serwerowo. Jej zadaniem jest pobranie wszystkich niezbędnych statystyk i przekazanie ich do komponentów prezentacyjnych.
- **Główne elementy**: `DashboardLayout`, reużywalny komponent `StatCard`.
- **Logika `---`**:
  - Wywołuje `StatisticsService.getLearningStats()` aby pobrać statystyki nauki.
  - Wywołuje `StatisticsService.getGenerationStats()` aby pobrać statystyki generowania.
  - Przekazuje pobrane dane jako propsy do odpowiednich komponentów `StatCard`.

### `StatCard.astro`
- **Opis komponentu**: Mały, reużywalny, statyczny komponent do wyświetlania pojedynczej metryki.
- **Główne elementy**: `Card`, wewnątrz `CardHeader` z tytułem (`Label`), `CardContent` z dużą, sformatowaną wartością (`Value`).
- **Propsy**:
  - `label: string` (np. "Skuteczność")
  - `value: string | number` (np. "85%" lub 150)
  - `description?: string` (opcjonalny opis metryki)

## 5. Typy
- **DTO**: `LearningStatsDTO`, `GenerationStatsDTO`. Te typy są używane w logice serwerowej do odbioru danych z serwisu.
- Nie są wymagane żadne nowe typy ViewModel. Dane z DTO są mapowane bezpośrednio na propsy komponentu `StatCard`.

## 6. Zarządzanie stanem
Ten widok jest w pełni statyczny i renderowany po stronie serwera. Nie wymaga żadnego zarządzania stanem po stronie klienta.

## 7. Integracja API
- Integracja odbywa się w całości po stronie serwera w `---` frontmatter strony `StatsPage.astro`.
- Wywołania (przez warstwę serwisową):
  - `statisticsService.getLearningStats()`
  - `statisticsService.getGenerationStats()`
- **Typy odpowiedzi**: `LearningStatsDTO`, `GenerationStatsDTO`.

## 8. Interakcje użytkownika
Jedyną interakcją jest nawigacja do tego widoku. Widok sam w sobie jest tylko do odczytu. Użytkownik może opcjonalnie mieć możliwość filtrowania statystyk (np. według kolekcji), co byłoby rozszerzeniem. W wersji MVP jest to widok statyczny.

## 9. Warunki i walidacja
- **Uwierzytelnienie**: Strona jest chroniona przez middleware.
- **Autoryzacja**: Logika serwisu zapewnia, że pobierane są statystyki tylko dla zalogowanego użytkownika.

## 10. Obsługa błędów
- **Błąd pobierania danych (SSR)**: Jeśli którykolwiek z serwisów statystyk zwróci błąd, strona `StatsPage.astro` powinna wyświetlić ogólny komunikat błędu, np. "Nie udało się załadować statystyk. Spróbuj ponownie później."

## 11. Kroki implementacji
1. Stworzyć plik `src/pages/dashboard/stats.astro`.
2. Użyć na stronie `DashboardLayout`.
3. Stworzyć reużywalny komponent `src/components/stats/StatCard.astro`.
4. W `---` frontmatter strony `stats.astro`, zaimplementować pobieranie obu typów statystyk za pomocą `StatisticsService`. Należy użyć `Promise.all` do równoległego pobierania danych.
5. Zaimplementować obsługę błędów na wypadek niepowodzenia pobierania danych.
6. W części HTML strony, zaimplementować layout siatki (grid).
7. Zmapować pobrane dane na instancje komponentu `StatCard`, przekazując odpowiednie `label` i `value`.
8. Dodać formatowanie do wartości (np. dodanie znaku "%" do skuteczności).
9. Dodać link powrotny do `/dashboard`. 