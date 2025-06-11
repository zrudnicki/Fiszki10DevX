# Architektura UI dla Fiszki

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla aplikacji Fiszki została zaprojektowana z priorytetem na prostotę, szybkość implementacji i łatwość testowania, zgodnie z decyzjami podjętymi podczas sesji planistycznej. Opiera się na architekturze zorientowanej na treść z wykorzystaniem Astro, gdzie większość logiki i renderowania odbywa się po stronie serwera (SSR).

Kluczowe zasady:
- **Server-Side First**: Strony są generowane serwerowo. Interaktywność po stronie klienta jest ograniczona do minimum i implementowana za pomocą izolowanych komponentów React (Astro Islands).
- **Brak złożonego stanu po stronie klienta**: Rezygnujemy z globalnych bibliotek do zarządzania stanem (jak Redux czy TanStack Query). Stan aplikacji jest odświeżany poprzez przeładowanie strony po akcjach użytkownika.
- **Tradycyjne formularze**: Interakcje zapisu danych (tworzenie, edycja) opierają się na standardowych formularzach HTML, które po wysłaniu wykonują pełne przeładowanie strony.
- **Nawigacja Hub-and-Spoke**: Centralnym punktem aplikacji po zalogowaniu jest Panel Główny (`/dashboard`), który działa jak hub z linkami do wszystkich głównych sekcji. Użytkownik wraca do niego, aby przejść do innej części aplikacji.

## 2. Lista widoków

### Widok 1: Strona Logowania / Rejestracji
- **Ścieżka widoku**: `/` (lub `/login`, `/register` w zależności od implementacji routera)
- **Główny cel**: Uwierzytelnienie użytkownika. Umożliwienie nowym użytkownikom założenia konta.
- **Kluczowe informacje do wyświetlenia**: Pola na email i hasło, przyciski akcji, link do przełączania się między logowaniem a rejestracją.
- **Kluczowe komponenty widoku**: `Card`, `Auth` (komponent React z logiką Supabase), `Input`, `Button`, `Label`.
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Jasne komunikaty o błędach walidacji (np. "Nieprawidłowy email") wyświetlane przy odpowiednich polach.
  - **Dostępność**: Poprawne etykiety (`Label`) dla pól formularza. Obsługa nawigacji klawiaturą.
  - **Bezpieczeństwo**: Komunikacja z API Supabase przez HTTPS.

### Widok 2: Panel Główny (Dashboard)
- **Ścieżka widoku**: `/dashboard`
- **Główny cel**: Służy jako centralny hub nawigacyjny do wszystkich głównych funkcji aplikacji.
- **Kluczowe informacje do wyświetlenia**: Wizualne linki (karty) do: Zarządzania Kolekcjami, Zarządzania Kategoriami, Sesji Nauki, Generowania Fiszek (AI i ręczne), Statystyk i **Ustawień Konta**.
- **Kluczowe komponenty widoku**: `Card` (jako klikalne linki), `AuthButton` (do wylogowania).
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Przejrzysty i intuicyjny układ, który natychmiastowo komunikuje dostępne opcje.
  - **Dostępność**: Linki zrealizowane jako semantyczne tagi `<a>`.
  - **Bezpieczeństwo**: Widok chroniony przez middleware, dostępny tylko dla zalogowanych użytkowników.

### Widok 3: Zarządzanie Kolekcjami
- **Ścieżka widoku**:
  - `/dashboard/collections` (Lista)
  - `/dashboard/collections/new` (Formularz tworzenia)
  - `/dashboard/collections/[id]/edit` (Formularz edycji)
  - `/dashboard/collections/[id]` (Szczegóły i lista fiszek)
- **Główny cel**: Umożliwienie użytkownikowi tworzenia, przeglądania, edycji i usuwania swoich kolekcji fiszek oraz zarządzania fiszkami wewnątrz nich.
- **Kluczowe informacje do wyświetlenia**:
  - **Lista**: Tabela z nazwami kolekcji, liczbą fiszek i przyciskami akcji. **Kliknięcie na nazwę kolekcji prowadzi do jej szczegółów.**
  - **Szczegóły**: Nazwa i opis kolekcji. Poniżej tabela z listą fiszek w tej kolekcji (front, back) i przyciskami akcji dla każdej fiszki ("Edytuj", "Usuń").
  - **Formularze**: Pola na nazwę i opis kolekcji.
- **Kluczowe komponenty widoku**: `Table`, `Button`, `Input`, `Textarea`, `Label`, `Card`.
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Po usunięciu kolekcji strona jest przeładowywana, a element znika z listy. To proste i przewidywalne zachowanie.
  - **Dostępność**: Tabela z odpowiednimi nagłówkami (`<th>`). Przyciski akcji z jasnymi etykietami.
  - **Bezpieczeństwo**: Wszystkie operacje są autoryzowane w API i ograniczone do zasobów zalogowanego użytkownika (RLS).

### Widok 4: Generowanie Fiszek AI
- **Ścieżka widoku**:
  - `/dashboard/ai/generate` (Formularz generowania)
  - `/dashboard/ai/review/[id]` (Recenzja wygenerowanych fiszek)
- **Główny cel**: Umożliwienie użytkownikowi wygenerowania fiszek z dostarczonego tekstu i ich recenzja.
- **Kluczowe informacje do wyświetlenia**:
  - **Formularz**: Duże pole `Textarea` na tekst źródłowy.
  - **Recenzja**: Lista wygenerowanych fiszek (front/back), każda z opcją "Akceptuj" (checkbox) i "Edytuj" (link). Obowiązkowy selektor (`Select`) do wyboru kolekcji, do której zostaną zapisane zaakceptowane fiszki.
- **Kluczowe komponenty widoku**: `Textarea`, `Checkbox`, `Button`, `Card`, `Select`.
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Proces jest podzielony na kroki (wprowadź tekst -> zrecenzuj -> zapisz), co prowadzi użytkownika za rękę. Edycja przekierowuje na osobną stronę, co upraszcza stan strony recenzji. Uczynienie wyboru kolekcji obowiązkowym na etapie recenzji daje użytkownikowi elastyczność.
  - **Dostępność**: Każda fiszka do recenzji jest w osobnej, logicznej grupie. Pola do edycji mają poprawne etykiety.
  - **Bezpieczeństwo**: Walidacja długości tekstu wejściowego po stronie serwera, aby zapobiec nadużyciom API.

### Widok 5: Sesja Nauki
- **Ścieżka widoku**:
  - `/dashboard/study/session` (Główny widok sesji)
  - `/dashboard/study/complete` (Strona podsumowania)
- **Główny cel**: Przeprowadzenie użytkownika przez sesję nauki z wykorzystaniem algorytmu spaced repetition.
- **Kluczowe informacje do wyświetlenia**:
  - **Sesja**: 10 fiszek (front i back) wyświetlonych na jednej stronie. Dla każdej fiszki opcje odpowiedzi (np. "Wymaga powtórki", "Częściowo", "Dobrze").
  - **Podsumowanie**: Komunikat z gratulacjami. Przyciski "Następna sesja" i "Zakończ na dziś".
- **Kluczowe komponenty widoku**: `Card` (dla każdej fiszki), `RadioGroup` lub `Button` (do oceny), `Button` (do zakończenia sesji).
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Wyświetlenie 10 fiszek na raz upraszcza interfejs, eliminując potrzebę przełączania. Strona podsumowania daje jasne opcje co do dalszych kroków.
  - **Dostępność**: Jasno oznaczone opcje odpowiedzi dla każdej fiszki.
  - **Bezpieczeństwo**: Sesja jest powiązana z zalogowanym użytkownikiem.

### Widok 6: Statystyki
- **Ścieżka widoku**: `/dashboard/stats`
- **Główny cel**: Zaprezentowanie użytkownikowi jego postępów w nauce i efektywności generowania fiszek.
- **Kluczowe informacje do wyświetlenia**: Kluczowe metryki z API (`/api/stats/learning`, `/api/stats/generation`) jako proste liczby, np. "Całkowita liczba recenzji", "Współczynnik akceptacji AI".
- **Kluczowe komponenty widoku**: `Card` (dla każdej metryki).
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Prosta i czytelna prezentacja danych, bez skomplikowanych wykresów.
  - **Dostępność**: Użycie kolorów do sygnalizacji (np. dobry/zły wskaźnik) musi być połączone z tekstową alternatywą lub etykietą ARIA.

### Widok 7: Ręczne Tworzenie Fiszki
- **Ścieżka widoku**: `/dashboard/flashcards/new`
- **Główny cel**: Umożliwienie użytkownikowi szybkiego, ręcznego dodania pojedynczej fiszki.
- **Kluczowe informacje do wyświetlenia**: Formularz z polami: `Input` na "Front", `Textarea` na "Back", oraz opcjonalnymi selektorami (`Select`) do przypisania fiszki do istniejącej Kolekcji i Kategorii.
- **Kluczowe komponenty widoku**: `Card`, `Input`, `Textarea`, `Label`, `Select`, `Button`.
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Po pomyślnym utworzeniu fiszki, użytkownik jest przekierowywany do listy kolekcji (`/dashboard/collections`), aby zobaczyć efekt swojej pracy.
  - **Dostępność**: Wszystkie pola formularza mają powiązane etykiety (`Label`).
  - **Bezpieczeństwo**: Dane formularza są walidowane po stronie serwera zgodnie ze schematem Zod.

### Widok 8: Zarządzanie Kategoriami
- **Ścieżka widoku**:
  - `/dashboard/categories` (Lista)
  - `/dashboard/categories/new` (Formularz tworzenia)
  - `/dashboard/categories/[id]/edit` (Formularz edycji)
- **Główny cel**: Zapewnienie pełnego interfejsu CRUD do zarządzania kategoriami przez użytkownika.
- **Kluczowe informacje do wyświetlenia**:
  - **Lista**: Tabela z nazwami kategorii i liczbą przypisanych fiszek. Przyciski akcji: "Edytuj", "Usuń". Przycisk do tworzenia nowej kategorii.
  - **Formularze**: Pole `Input` na nazwę kategorii.
- **Kluczowe komponenty widoku**: `Table`, `Button`, `Input`, `Label`, `Card`.
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Interfejs i przepływ są spójne z widokiem "Zarządzanie Kolekcjami", co zapewnia przewidywalne doświadczenie. Usunięcie powoduje przeładowanie strony.
  - **Dostępność**: Standardowe zastosowanie dostępnych tabel i formularzy.
  - **Bezpieczeństwo**: Operacje chronione przez middleware i RLS w bazie danych.

### Widok 9: Ustawienia i Usuwanie Konta
- **Ścieżka widoku**: `/dashboard/account`
- **Główny cel**: Umożliwienie użytkownikowi zarządzania swoim kontem, w tym jego permanentnego usunięcia.
- **Kluczowe informacje do wyświetlenia**: Informacje o koncie (np. email użytkownika). Wyraźnie oznaczona sekcja "Strefa Zagrożenia" (`Danger Zone`).
- **Kluczowe komponenty widoku**: `Card`, `Button` (w wariancie `destructive`), `AlertDialog` (do potwierdzenia usunięcia).
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Akcja usunięcia konta jest nieodwracalna, dlatego musi być chroniona przez modal potwierdzający (`AlertDialog`). Aby zapobiec przypadkowemu kliknięciu, modal może wymagać od użytkownika wpisania np. swojego adresu email lub frazy "USUŃ", aby aktywować finalny przycisk.
  - **Dostępność**: Przycisk usuwania musi jasno komunikować swoją funkcję. `AlertDialog` musi być w pełni dostępny (zarządzanie focusem, obsługa klawiatury).
  - **Bezpieczeństwo**: Operacja usunięcia musi być wywołana po stronie serwera przez dedykowany endpoint API, który ma uprawnienia do usuwania użytkownika i wszystkich powiązanych z nim danych z bazy Supabase.

### Widok 10: Edycja Fiszki
- **Ścieżka widoku**: `/dashboard/flashcards/[id]/edit`
- **Główny cel**: Umożliwienie użytkownikowi edycji istniejącej fiszki.
- **Kluczowe informacje do wyświetlenia**: Formularz z polami `Input` na "Front" i `Textarea` na "Back" wstępnie wypełnionymi danymi fiszki.
- **Kluczowe komponenty widoku**: `Card`, `Input`, `Textarea`, `Label`, `Button`.
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Po zapisaniu zmian, użytkownik jest przekierowywany z powrotem do widoku szczegółów kolekcji, z której przyszedł, aby zobaczyć zaktualizowaną listę.
  - **Dostępność**: Pola formularza mają odpowiednie etykiety i są powiązane z danymi.
  - **Bezpieczeństwo**: Endpoint `PUT /api/flashcards/[id]` jest chroniony i zapewnia, że użytkownik może edytować tylko własne fiszki.

## 3. Mapa podróży użytkownika

**Przypadek użycia 1: Generowanie fiszek przez AI i rozpoczęcie nauki.**
1.  **Krok 1: Logowanie**: Użytkownik ląduje na ` / ` i loguje się. Po sukcesie jest przekierowany do `/dashboard`.
2.  **Krok 2: Inicjacja generowania**: W Panelu Głównym (`/dashboard`) użytkownik klika link "Generuj fiszki z tekstu" i przechodzi do `/dashboard/ai/generate`.
3.  **Krok 3: Wprowadzenie danych**: Użytkownik wkleja tekst do pola `Textarea` i klika "Generuj". Formularz jest wysyłany.
4.  **Krok 4: Recenzja**: Użytkownik jest przekierowany na stronę `/dashboard/ai/review/[id]`, gdzie widzi listę propozycji fiszek. Przegląda je, opcjonalnie edytuje kilka z nich (co wiąże się z przejściem na podstronę edycji i powrotem) i odznacza te, których nie chce.
5.  **Krok 5: Zapis fiszek**: Użytkownik klika "Zapisz zaakceptowane fiszki". Formularz z danymi jest wysyłany do `POST /api/flashcards/bulk`.
6.  **Krok 6: Powrót do kolekcji**: Po pomyślnym zapisie użytkownik jest przekierowany do listy swoich kolekcji (`/dashboard/collections`), gdzie widzi zaktualizowaną liczbę fiszek.
7.  **Krok 7: Rozpoczęcie nauki**: Użytkownik wraca do Panelu Głównego (`/dashboard`) i klika "Rozpocznij sesję nauki", przechodząc do `/dashboard/study/session`.
8.  **Krok 8: Sesja nauki**: Użytkownik ocenia 10 fiszek i klika "Zakończ sesję".
9.  **Krok 9: Podsumowanie**: Użytkownik widzi stronę z gratulacjami (`/dashboard/study/complete`) i decyduje, czy chce kontynuować, czy zakończyć naukę na dziś, co przekierowuje go z powrotem do `/dashboard`.

**Przypadek użycia 2: Ręczne tworzenie fiszki.**
1.  **Krok 1: Logowanie**: Użytkownik loguje się i trafia na `/dashboard`.
2.  **Krok 2: Inicjacja tworzenia**: W Panelu Głównym klika link "Twórz fiszki ręcznie", przechodząc do `/dashboard/flashcards/new`.
3.  **Krok 3: Wypełnienie formularza**: Użytkownik wypełnia pola "Front" i "Back" oraz opcjonalnie wybiera Kolekcję i Kategorię.
4.  **Krok 4: Zapis**: Użytkownik klika "Zapisz fiszkę". Formularz jest wysyłany do `POST /api/flashcards`.
5.  **Krok 5: Potwierdzenie**: Po pomyślnym zapisie, użytkownik jest przekierowywany na listę kolekcji (`/dashboard/collections`), gdzie może zobaczyć zaktualizowany stan.

**Przypadek użycia 3: Usunięcie konta.**
1.  **Krok 1: Logowanie**: Użytkownik loguje się i trafia na `/dashboard`.
2.  **Krok 2: Nawigacja do ustawień**: W Panelu Głównym klika link "Ustawienia Konta", przechodząc do `/dashboard/account`.
3.  **Krok 3: Inicjacja usunięcia**: Użytkownik klika przycisk "Usuń konto".
4.  **Krok 4: Potwierdzenie**: Na ekranie pojawia się modal `AlertDialog` z ostrzeżeniem o nieodwracalności tej akcji i prośbą o potwierdzenie.
5.  **Krok 5: Finalizacja**: Użytkownik potwierdza usunięcie. Wywoływany jest odpowiedni endpoint API.
6.  **Krok 6: Wylogowanie i przekierowanie**: Po pomyślnym usunięciu konta, użytkownik jest automatycznie wylogowywany, a jego sesja kończona. Następuje przekierowanie na stronę główną (`/`).

**Przypadek użycia 4: Edycja istniejącej fiszki.**
1.  **Krok 1: Nawigacja do kolekcji**: Użytkownik loguje się, trafia na `/dashboard`, a następnie przechodzi do listy kolekcji (`/dashboard/collections`).
2.  **Krok 2: Wybór kolekcji**: Użytkownik klika na nazwę kolekcji, którą chce przejrzeć. Zostaje przekierowany do strony szczegółów tej kolekcji (`/dashboard/collections/[id]`).
3.  **Krok 3: Inicjacja edycji**: Na liście fiszek w danej kolekcji, użytkownik znajduje interesującą go fiszkę i klika przycisk "Edytuj". Zostaje przekierowany na stronę edycji fiszki (`/dashboard/flashcards/[id]/edit`).
4.  **Krok 4: Modyfikacja fiszki**: Użytkownik zmienia treść w polach "Front" lub "Back" i klika "Zapisz zmiany".
5.  **Krok 5: Powrót i weryfikacja**: Po zapisaniu, użytkownik jest przekierowywany z powrotem na stronę szczegółów kolekcji (`/dashboard/collections/[id]`), gdzie widzi zaktualizowaną treść fiszki na liście.

## 4. Układ i struktura nawigacji

- **Model Hub-and-Spoke**: Nawigacja opiera się na powrotach do centralnego punktu (`/dashboard`).
- **Brak stałej nawigacji**: W MVP nie ma globalnego paska bocznego ani górnego menu nawigacyjnego. Upraszcza to layout i implementację.
- **Elementy nawigacyjne**:
  - Panel Główny (`/dashboard`) zawiera `Card` z linkami `<a>` do podstron, w tym do nowo dodanych: "Twórz fiszki ręcznie" oraz "Zarządzaj Kategoriami".
  - Każda podstrona powinna zawierać wyraźny link powrotny, np. "‹ Wróć do Panelu", prowadzący do `/dashboard`.
  - Wylogowanie jest możliwe z Panelu Głównego za pomocą komponentu `AuthButton`.

## 5. Kluczowe komponenty

Poniższe komponenty (głównie z biblioteki Shadcn/ui) będą reużywane w całej aplikacji:

- **`Card`**: Podstawowy kontener do grupowania treści, używany na dashboardzie, w listach i formularzach.
- **`Button`**: Standardowy przycisk do wszystkich akcji (submit, nawigacja, usuwanie).
- **`Input`, `Textarea`, `Label`**: Standardowe elementy formularzy.
- **`Table`**: Do prezentacji danych listowych (kolekcje, fiszki, kategorie).
- **`Checkbox`**: Do zaznaczania opcji (np. akceptacji fiszek AI).
- **`Select`**: Do wyboru opcji z listy (np. kolekcji lub kategorii).
- **`AuthButton`**: Istniejący komponent React do obsługi wylogowywania.
- **`Alert` / `AlertDescription`**: Do wyświetlania globalnych błędów lub ważnych komunikatów.
- **`AlertDialog`**: Do potwierdzania akcji destrukcyjnych, takich jak usuwanie konta czy kolekcji. 