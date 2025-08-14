<test_plan>

Opis Projektu
(Projekt to aplikacja internetowa do fiszek o nazwie "Fiszki", zaprojektowana jako osobisty asystent do nauki. Wykorzystuje sztuczną inteligencję do automatycznego generowania fiszek z tekstu dostarczonego przez użytkownika. Kluczowe funkcje obejmują uwierzytelnianie użytkowników, tworzenie fiszek ręcznie i za pomocą AI oraz organizowanie fiszek w kolekcje i kategorie. Stos technologiczny obejmuje Astro i React dla frontendu, Supabase jako backend i bazę danych oraz API OpenRouter do obsługi funkcji AI.)

Cele Testów
( - Weryfikacja, czy wszystkie wymagania funkcjonalne są spełnione, w tym uwierzytelnianie użytkownika, operacje CRUD (tworzenie, odczyt, aktualizacja, usuwanie) dla kolekcji, kategorii i fiszek.

Zapewnienie, że proces generowania fiszek przez AI jest niezawodny, od przesłania tekstu po recenzję i akceptację fiszek.

Walidacja integralności i bezpieczeństwa backendowych punktów końcowych API, w tym sprawdzanie uwierzytelniania i walidacji danych.

Zagwarantowanie płynnego i intuicyjnego doświadczenia użytkownika we wszystkich funkcjach.

Potwierdzenie, że aplikacja jest responsywna i działa poprawnie w głównych przeglądarkach internetowych i na różnych rozmiarach urządzeń.

Zapewnienie, że trwałość danych i zarządzanie stanem, w tym użycie localStorage, są obsługiwane prawidłowo.)

Funkcje do Przetestowania
( - Uwierzytelnianie: Rejestracja użytkownika, logowanie (e-mail/hasło i dostawcy społecznościowi), wylogowywanie, zarządzanie sesją i kontrola dostępu do chronionych ścieżek/stron.

Panel Główny (Dashboard): Układ, linki nawigacyjne i ogólna struktura.

Zarządzanie Kolekcjami: Operacje CRUD (Create, Read, Update, Delete) dla kolekcji fiszek.

Zarządzanie Kategoriami: Operacje CRUD dla kategorii.

Ręczne Zarządzanie Fiszkami: Ręczne tworzenie, odczytywanie, aktualizowanie i usuwanie pojedynczych fiszek.

Generowanie Fiszek przez AI:

Przesyłanie tekstu do generowania.

Walidacja danych wejściowych (np. limity znaków).

Interakcja API z usługą AI.

Obsługa pomyślnego generowania i stanów błędów (np. błędy API, ograniczanie liczby żądań).

Recenzja i Akceptacja Fiszek AI:

Pobieranie kandydatów na fiszki z localStorage.

Wyświetlanie kandydatów do recenzji przez użytkownika.

Akceptowanie i zapisywanie wybranych fiszek w kolekcji.

Czyszczenie danych (usunięcie z localStorage) i przekierowanie po akceptacji.

Punkty Końcowe API:

Bezpieczeństwo (uwierzytelnianie i autoryzacja).

Walidacja danych (schematy Zod).

Prawidłowa obsługa żądań GET, POST, PUT, DELETE для wszystkich zasobów.

Operacje masowe (/api/flashcards/bulk).

Logika Powtórek Rozłożonych w Czasie (Spaced Repetition):

Poprawne obliczanie dat następnych powtórek na podstawie wyników użytkownika (testy jednostkowe dla spaced-repetition.ts).

Poprawny wybór kart do różnych typów sesji nauki (testy jednostkowe dla study.service.ts).)

Rodzaje Testów
( - Testy Jednostkowe: Do testowania pojedynczych funkcji i komponentów w izolacji. Jest to kluczowe dla funkcji pomocniczych, takich jak spaced-repetition.ts, oraz do testowania komponentów React z mockowanymi właściwościami i usługami. Zalecany jest framework Vitest.

Testy Integracyjne: Do testowania interakcji między różnymi częściami aplikacji, takimi jak komunikacja między komponentem React a odpowiadającą mu usługą lub interakcja usługi z klientem Supabase. Mock Service Worker (MSW) może być używany do mockowania odpowiedzi API w testach frontendu.

Testy End-to-End (E2E): Do testowania kompletnych przepływów pracy z perspektywy użytkownika. Obejmuje to symulowanie działań użytkownika, takich jak logowanie, generowanie fiszek i ich zapisywanie. Odpowiednie do tego są narzędzia takie jak Playwright lub Cypress.

Testy API: Do bezpośredniego testowania punktów końcowych REST API w src/pages/api/. Zapewnia to, że logika backendu, walidacja danych i bezpieczeństwo (Row Level Security w Supabase) działają zgodnie z oczekiwaniami. Można to zautomatyzować za pomocą frameworków takich jak supertest lub przeprowadzić ręcznie za pomocą narzędzi takich jak Postman.

Testy Wydajnościowe: Do oceny czasu odpowiedzi punktów końcowych API, zwłaszcza punktu końcowego generowania AI, który opiera się na usłudze zewnętrznej.

Testy Użyteczności i Interfejsu Użytkownika (UI): Aby upewnić się, że interfejs użytkownika jest intuicyjny, dostępny i wizualnie spójny w różnych przeglądarkach i na różnych rozmiarach ekranu.)

Przypadki Testowe
(
| ID Przypadku Testowego | Opis Przypadku Testowego | Warunki Wstępne | Kroki Testowe | Oczekiwane Rezultaty | Priorytet |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Uwierzytelnianie |
| AUTH-001 | Użytkownik loguje się przy użyciu prawidłowych danych | Użytkownik ma istniejące konto. | 1. Przejdź do /login. <br> 2. Wprowadź prawidłowy e-mail i hasło. <br> 3. Kliknij "Zaloguj się". | Użytkownik jest przekierowywany do panelu głównego (/). Adres e-mail użytkownika jest widoczny w nawigacji. | Wysoki |
| AUTH-002 | Użytkownik próbuje zalogować się przy użyciu nieprawidłowych danych | Brak. | 1. Przejdź do /login. <br> 2. Wprowadź nieprawidłowy e-mail/hasło. <br> 3. Kliknij "Zaloguj się". | Wyświetlany jest komunikat o błędzie. Użytkownik pozostaje na stronie logowania. | Wysoki |
| AUTH-003 | Użytkownik wylogowuje się | Użytkownik jest zalogowany. | 1. Kliknij przycisk "Wyloguj" w nawigacji lub panelu głównym. | Użytkownik jest przekierowywany na stronę główną (/). Widoczny jest link "Zaloguj się". | Wysoki |
| AUTH-004 | Niezalogowany użytkownik próbuje uzyskać dostęp do strony panelu głównego | Użytkownik nie jest zalogowany. | 1. Przejdź bezpośrednio do /dashboard/collections. | Użytkownik jest przekierowywany na stronę logowania (/login) lub widzi komunikat "Wymagane logowanie". | Wysoki |
| Kolekcje |
| COLL-001 | Użytkownik tworzy nową kolekcję | Użytkownik jest zalogowany. | 1. Przejdź do /dashboard/collections/new. <br> 2. Wypełnij nazwę kolekcji. <br> 3. Kliknij "Zapisz zmiany". | Użytkownik jest przekierowywany do listy kolekcji. Nowa kolekcja jest widoczna na liście. | Wysoki |
| COLL-002 | Użytkownik edytuje istniejącą kolekcję | Użytkownik jest zalogowany i ma co najmniej jedną kolekcję. | 1. Przejdź do listy kolekcji. <br> 2. Kliknij "Edytuj" przy kolekcji. <br> 3. Zmień nazwę i/lub opis. <br> 4. Kliknij "Zapisz zmiany". | Użytkownik jest przekierowywany do listy kolekcji. Wyświetlana jest zaktualizowana nazwa/opis kolekcji. | Średni |
| COLL-003 | Użytkownik usuwa kolekcję | Użytkownik jest zalogowany i ma co najmniej jedną kolekcję. | 1. Przejdź do listy kolekcji. <br> 2. Kliknij "Usuń" przy kolekcji. <br> 3. Potwierdź usunięcie. | Kolekcja zostaje usunięta z listy. | Średni |
| Generowanie Fiszek przez AI |
| AI-GEN-001 | Pomyślne wygenerowanie fiszek z prawidłowego tekstu | Użytkownik jest zalogowany i ma co najmniej jedną kolekcję. | 1. Przejdź do /dashboard/ai/generate. <br> 2. Wybierz kolekcję. <br> 3. Wklej tekst o długości od 1000 do 10000 znaków. <br> 4. Kliknij "Generuj". | Użytkownik jest przekierowywany na stronę recenzji (/dashboard/ai/review/[generationId]). Wygenerowane fiszki są przechowywane w localStorage i wyświetlane na stronie recenzji. | Wysoki |
| AI-GEN-002 | Próba wygenerowania fiszek ze zbyt krótkiego tekstu | Użytkownik jest zalogowany. | 1. Przejdź do /dashboard/ai/generate. <br> 2. Wklej tekst krótszy niż 1000 znaków. <br> 4. Kliknij "Generuj". | Wyświetlany jest komunikat o błędzie "Tekst musi mieć minimum 1000 znaków". Użytkownik nie jest przekierowywany. | Średni |
| AI-GEN-003 | Próba wygenerowania fiszek bez zalogowania | Użytkownik nie jest zalogowany. | 1. Przejdź do /dashboard/ai/generate. | Wyświetlany jest komunikat "Wymagane logowanie" z linkiem do strony logowania. | Wysoki |
| Recenzja Fiszek AI |
| AI-REV-001 | Użytkownik recenzuje i akceptuje wygenerowane fiszki | Użytkownik właśnie wygenerował fiszki i znajduje się na stronie recenzji. | 1. Na stronie /dashboard/ai/review/... przejrzyj fiszki. <br> 2. Kliknij "Zaakceptuj fiszki". | Użytkownik jest przekierowywany na stronę odpowiedniej kolekcji. Element generatedFlashcards zostaje usunięty z localStorage. Nowe fiszki są teraz częścią kolekcji. | Wysoki |
| AI-REV-002 | Użytkownik przechodzi na stronę recenzji z nieaktualnym/nieprawidłowym ID generowania | Brak. | 1. Przejdź bezpośrednio do /dashboard/ai/review/invalid-id. | Wyświetlany jest komunikat o błędzie informujący, że nie można znaleźć danych, z linkiem powrotnym do strony generowania. | Średni |
| AI-REV-003 | Użytkownik anuluje proces recenzji | Użytkownik znajduje się na stronie recenzji. | 1. Kliknij przycisk lub link "Anuluj". | Użytkownik jest przekierowywany z powrotem na stronę generowania (/dashboard/ai/generate). Żadne fiszki nie są zapisywane. | Średni |
)

Środowisko Testowe
( - Frameworki: Vitest do testów jednostkowych/integracyjnych, Playwright do testów E2E.

Przeglądarki: Najnowsze stabilne wersje Chrome, Firefox i Safari.

Backend: Dedykowane środowisko testowe na Supabase. Powinien to być oddzielny projekt, aby uniknąć konfliktów z danymi deweloperskimi lub produkcyjnymi. Będzie miał własny adres URL i klucze API.

CI/CD: Testy powinny być zintegrowane z potokiem CI/CD (np. przy użyciu GitHub Actions), aby uruchamiały się automatycznie przy każdym pull requeście do głównej gałęzi.

Zmienne Środowiskowe: Oddzielny plik .env.test będzie używany do przechowywania poświadczeń do testowego projektu Supabase i wszelkich innych konfiguracji specyficznych dla testów.)

Strategia Wykonywania Testów
( 1. Testy Jednostkowe i Integracyjne: Powinny być uruchamiane jako pierwsze, ponieważ są najszybsze i mogą wcześnie wykryć problemy. Będą wykonywane przy każdym zapisie pliku podczas developmentu oraz jako wstępny krok w potoku CI. 2. Testy API: Uruchamiane po testach jednostkowych/integracyjnych. Będą one przeprowadzane na wdrożonym środowisku testowym w potoku CI, aby upewnić się, że backend jest stabilny przed uruchomieniem testów E2E. 3. Testy End-to-End (E2E): Są to najbardziej kompleksowe testy i będą uruchamiane jako ostatnie w potoku CI. Będą testować krytyczne ścieżki użytkownika zdefiniowane w przypadkach testowych. 4. Testy Manualne: Testy eksploracyjne i użyteczności będą przeprowadzane ręcznie przed głównym wydaniem, aby wychwycić problemy nieobjęte testami automatycznymi. 5. Testy Regresji: Pełny zestaw zautomatyzowanych testów (jednostkowych, API, E2E) będzie uruchamiany przed każdym wdrożeniem na produkcję, aby zapobiec regresjom.)

Ryzyka i Mitygacja
(
| Ryzyko | Strategia Mitygacji |
| :--- | :--- |
| Niedostępność lub zmiany w zewnętrznym serwisie AI (OpenRouter) | - Mockowanie (symulowanie) serwisu AI we wszystkich testach jednostkowych, integracyjnych i większości E2E. <br> - Implementacja solidnej obsługi błędów, limitów czasu i mechanizmów ponawiania prób w AIGenerationService. <br> - Posiadanie ograniczonego zestawu testów "kanarkowych" (canary tests), które uruchamiane są przeciwko rzeczywistemu serwisowi AI w celu wykrywania zmian powodujących błędy. |
| Kruchy transfer danych przez localStorage | - Zależność od localStorage w procesie recenzji AI jest krytycznym punktem awarii. Testy E2E muszą dokładnie pokrywać ten przepływ. <br> - Długoterminowym rozwiązaniem byłaby refaktoryzacja tego mechanizmu w celu przechowywania sesji generowania na backendzie (np. w tymczasowej tabeli bazy danych lub w pamięci podręcznej Redis), co byłoby bardziej niezawodne. |
| Niespójna treść generowana przez AI | - OpenRouterClient powinien mieć ścisłe parsowanie i walidację danych wyjściowych JSON z AI. Testy jednostkowe powinny obejmować przypadki z nieprawidłowo sformatowanym lub nieoczekiwanym JSON-em. <br> - Interfejs użytkownika powinien elegancko obsługiwać przypadki, w których AI zwraca mniej kart niż zażądano lub nieprawidłowe dane. |
| Zarządzanie Danymi Testowymi w Supabase | - W przypadku testów E2E i API, każdy zestaw testów powinien być odpowiedzialny za tworzenie i usuwanie własnych danych, aby zapewnić izolację i powtarzalność testów. Używanie unikalnych identyfikatorów dla danych testowych. <br> - Wykorzystanie transakcji bazodanowych (begin i rollback), tam gdzie to możliwe, w celu szybszego czyszczenia danych. |
)

Wnioski
(Niniejszy plan testów przedstawia kompleksową strategię zapewnienia jakości i niezawodności aplikacji "Fiszki". Łącząc testy jednostkowe, integracyjne, API i E2E, możemy zbudować zaufanie do funkcjonalności aplikacji, od usług backendowych po doświadczenie użytkownika końcowego. Pomyślne wykonanie tego planu jest kluczowe dla wczesnego identyfikowania defektów, mitygacji ryzyk związanych z usługami zewnętrznymi oraz dostarczenia wysokiej jakości, stabilnego produktu użytkownikom.)
</test_plan>

Google Search Suggestions
Display of Search Suggestions is required when using Grounding with Google Search. Learn more
Translate "test plan for software project" to Polish
Jak przetłumaczyć "Project Overview" na polski w kontekście IT
Jak przetłumaczyć "Test Objectives" na polski w kontekście IT
Jak przetłumaczyć "Features to be Tested" na polski w kontekście IT
Jak przetłumaczyć "Types of Testing" na polski w kontekście IT
Jak przetłumaczyć "Test Cases" na polski w kontekście IT
Jak przetłumaczyć "Test Environment" na polski w kontekście IT
Jak przetłumaczyć "Test Execution Strategy" na polski w kontekście IT
Jak przetłumaczyć "Risks and Mitigation" na polski w kontekście IT
Jak przetłumaczyć "Conclusion" na polski w kontekście IT
Tłumaczenie terminologii testowania oprogramowania na polski
