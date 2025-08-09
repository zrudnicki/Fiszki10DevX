# Plan Testów Aplikacji "Fiszki"

---

### **1. Wprowadzenie i Cele Testowania**

**1.1. Wprowadzenie**

Niniejszy dokument przedstawia kompleksowy plan testów dla aplikacji internetowej "Fiszki" – osobistego asystenta do nauki opartego na sztucznej inteligencji. Aplikacja umożliwia użytkownikom tworzenie, zarządzanie i naukę z fiszek, z kluczową funkcjonalnością automatycznego generowania ich z dostarczonego tekstu. Plan ten ma na celu zapewnienie najwyższej jakości, stabilności i bezpieczeństwa aplikacji przed jej wdrożeniem produkcyjnym.

**1.2. Cele Testowania**

Główne cele procesu testowego to:
- **Weryfikacja Funkcjonalności:** Potwierdzenie, że wszystkie funkcje aplikacji, w tym uwierzytelnianie, zarządzanie kolekcjami, kategoriami i fiszkami (CRUD), działają zgodnie ze specyfikacją.
- **Zapewnienie Niezawodności Procesu AI:** Upewnienie się, że przepływ generowania fiszek przez AI – od przesłania tekstu, przez recenzję, aż po zapis – jest stabilny, wydajny i odporny na błędy.
- **Walidacja Bezpieczeństwa:** Sprawdzenie, czy dane użytkowników są odpowiednio izolowane i chronione, a dostęp do zasobów jest możliwy tylko dla autoryzowanych osób.
- **Ocena Doświadczenia Użytkownika (UX):** Zapewnienie, że interfejs jest intuicyjny, responsywny i spójny na różnych urządzeniach i w popularnych przeglądarkach.
- **Potwierdzenie Integralności Danych:** Weryfikacja, że wszystkie dane są poprawnie zapisywane, aktualizowane i usuwane w bazie danych, a stan aplikacji jest spójnie zarządzany.

---

### **2. Zakres Testów**

**2.1. Funkcjonalności objęte testami:**
- System uwierzytelniania użytkowników (rejestracja, logowanie, wylogowywanie, sesje).
- Pełen cykl życia (CRUD) dla kolekcji fiszek.
- Pełen cykl życia (CRUD) dla kategorii.
- Ręczne tworzenie i zarządzanie fiszkami (CRUD).
- Kompletny proces generowania fiszek z użyciem AI.
- Proces recenzji i akceptacji fiszek wygenerowanych przez AI.
- Wszystkie punkty końcowe API (walidacja, autoryzacja, obsługa żądań).
- Podstawowa responsywność interfejsu użytkownika (desktop, mobile).

**2.2. Funkcjonalności wyłączone z testów:**
- Zaawansowane testy obciążeniowe i wydajnościowe symulujące tysiące jednoczesnych użytkowników.
- Szczegółowe testy kompatybilności ze starszymi lub niszowymi przeglądarkami internetowymi.
- Testy jakości samego modelu językowego AI (zakładamy, że zewnętrzna usługa działa poprawnie).

---

### **3. Typy Testów do Przeprowadzenia**

- **Testy Jednostkowe:** Koncentrują się na weryfikacji małych, izolowanych fragmentów kodu, głównie w warstwie logiki biznesowej (`src/lib/services/`, `src/lib/utils/`). Mają na celu zapewnienie poprawności algorytmów (np. `spaced-repetition.ts`) i funkcji pomocniczych.
- **Testy Integracyjne:** Weryfikują współpracę pomiędzy różnymi modułami aplikacji, np. między komponentem UI a serwisem backendowym, lub między serwisem a bazą danych. Sprawdzą, czy dane przepływają poprawnie przez system.
- **Testy End-to-End (E2E):** Symulują rzeczywiste scenariusze użycia z perspektywy użytkownika. Testy te obejmą całe przepływy, takie jak rejestracja, stworzenie kolekcji, wygenerowanie fiszek AI, ich akceptacja i wylogowanie.
- **Testy API:** Bezpośrednie testowanie punktów końcowych REST API (`src/pages/api/`) w celu weryfikacji logiki serwera, schematów walidacji danych (Zod), obsługi błędów oraz zabezpieczeń (autoryzacja).
- **Testy Użyteczności i Interfejsu Użytkownika (UI):** Manualne testy mające na celu ocenę intuicyjności, czytelności i ogólnej wygody korzystania z aplikacji.
- **Testy Kompatybilności:** Weryfikacja poprawnego działania i wyświetlania aplikacji w najnowszych wersjach popularnych przeglądarek (Chrome, Firefox, Safari).

---

### **4. Scenariusze Testowe dla Kluczowych Funkcjonalności**

| ID Scenariusza | Funkcjonalność | Opis Scenariusza | Priorytet |
| :--- | :--- | :--- | :--- |
| **Uwierzytelnianie** |
| SC-AUTH-01 | Logowanie i Dostęp | Użytkownik loguje się, uzyskuje dostęp do panelu głównego, a po wylogowaniu traci dostęp do chronionych zasobów. | **Krytyczny** |
| SC-AUTH-02 | Izolacja Danych | Użytkownik A po zalogowaniu nie ma dostępu do danych (kolekcji, fiszek) użytkownika B. | **Krytyczny** |
| **Generowanie Fiszek AI** |
| SC-AI-01 | Pełen Cykl Generowania | Użytkownik loguje się, tworzy kolekcję, przechodzi do formularza generowania, wkleja poprawny tekst, generuje fiszki, recenzuje je, akceptuje i widzi je w swojej kolekcji. | **Krytyczny** |
| SC-AI-02 | Obsługa Nieprawidłowych Danych | Użytkownik próbuje wygenerować fiszki z tekstu, który jest zbyt krótki lub zbyt długi. Aplikacja wyświetla stosowny komunikat błędu i blokuje wysłanie żądania. | **Wysoki** |
| SC-AI-03 | Błąd Usługi Zewnętrznej | Podczas generowania fiszek występuje błąd po stronie API (np. OpenRouter jest niedostępny). Interfejs użytkownika informuje o problemie w czytelny sposób, nie blokując aplikacji. | **Wysoki** |
| **Zarządzanie Kolekcjami** |
| SC-COLL-01 | Pełen Cykl Życia Kolekcji | Użytkownik tworzy nową kolekcję, edytuje jej nazwę i opis, a na końcu ją usuwa. Wszystkie zmiany są poprawnie odzwierciedlone w interfejsie i bazie danych. | **Wysoki** |
| **Sesja Nauki** |
| SC-STUDY-01 | Rozpoczęcie i Zakończenie Sesji | Użytkownik wybiera kolekcję z fiszkami i rozpoczyna sesję nauki. Odpowiada na kilka pytań, a następnie kończy sesję. System poprawnie aktualizuje parametry powtórek dla ocenionych fiszek. | **Wysoki** |

---

### **5. Środowisko Testowe**

- **Serwer:** Dedykowany, odizolowany projekt w Supabase przeznaczony wyłącznie do celów testowych. Będzie on zawierał własne klucze API i bazę danych, co zapobiegnie konfliktom z środowiskiem deweloperskim i produkcyjnym.
- **Dane Testowe:** Skrypty do seedowania bazy danych (np. tworzenia testowych użytkowników, kolekcji) będą przygotowane w celu zapewnienia spójnych i powtarzalnych warunków testowych.
- **Przeglądarki:** Najnowsze stabilne wersje Google Chrome, Mozilla Firefox oraz Apple Safari.
- **System CI/CD:** Zautomatyzowane testy będą uruchamiane w ramach potoku CI/CD (np. GitHub Actions) przy każdym pushu do gałęzi deweloperskiej i przed każdym wdrożeniem na produkcję.

---

### **6. Narzędzia do Testowania**

- **Testy Jednostkowe i Integracyjne:** **Vitest** z **React Testing Library** do testowania komponentów React i logiki w środowisku Node.js.
- **Testy End-to-End (E2E):** **Playwright** do automatyzacji interakcji z przeglądarką i weryfikacji kompletnych przepływów użytkownika.
- **Testy API:** **Supertest** (w ramach Vitest) do zautomatyzowanych testów API oraz **Postman/Insomnia** do manualnej eksploracji i debugowania punktów końcowych.
- **Mockowanie API:** **Mock Service Worker (MSW)** do mockowania odpowiedzi z zewnętrznych API (np. OpenRouter) oraz własnego backendu podczas testów frontendu.

---

### **7. Harmonogram Testów**

Proces testowy będzie przebiegał iteracyjnie, równolegle z procesem deweloperskim.

- **Faza 1 (Setup i testy rdzenia):**
  - Konfiguracja środowiska testowego i potoków CI/CD.
  - Implementacja testów jednostkowych dla kluczowych serwisów i logiki (`services`, `utils`).
  - Implementacja testów API dla endpointów uwierzytelniania i CRUD.
- **Faza 2 (Testy E2E krytycznych ścieżek):**
  - Stworzenie zautomatyzowanych testów E2E dla procesów rejestracji, logowania oraz generowania i akceptacji fiszek AI.
- **Faza 3 (Pełne pokrycie funkcjonalne):**
  - Rozszerzenie testów E2E o pozostałe funkcjonalności CRUD (kategorie, ręczne tworzenie fiszek).
  - Przeprowadzenie manualnych testów użyteczności i kompatybilności.
- **Faza 4 (Testy regresji i UAT):**
  - Przed każdym wydaniem zostanie uruchomiony pełny zestaw zautomatyzowanych testów regresji.
  - Przeprowadzenie testów akceptacyjnych użytkownika (UAT) w celu ostatecznego zatwierdzenia funkcjonalności.

---

### **8. Kryteria Akceptacji Testów**

Aplikacja zostanie uznana za gotową do wdrożenia produkcyjnego, gdy zostaną spełnione następujące kryteria:

- **Pokrycie Kodu:** Pokrycie kodu testami jednostkowymi dla logiki biznesowej (`src/lib/services`, `src/lib/utils`) wynosi co najmniej 90%.
- **Testy Automatyczne:** 100% zautomatyzowanych testów E2E dla krytycznych ścieżek użytkownika kończy się powodzeniem.
- **Błędy:** Brak otwartych błędów o priorytecie krytycznym lub wysokim.
- **Wydajność:** Czas odpowiedzi API dla typowych operacji (z wyłączeniem generowania AI) nie przekracza 500 ms.
- **Akceptacja:** Wszystkie scenariusze UAT zostały pomyślnie zakończone i zatwierdzone przez właściciela produktu.

---

### **9. Role i Odpowiedzialności**

- **Deweloperzy:**
  - Odpowiedzialni za pisanie i utrzymanie testów jednostkowych oraz integracyjnych dla tworzonego przez siebie kodu.
  - Odpowiedzialni za naprawę błędów zgłoszonych przez zespół QA.
- **Inżynier QA (ten dokument):**
  - Odpowiedzialny za tworzenie, utrzymanie i wykonywanie zautomatyzowanych testów E2E i API.
  - Przeprowadzanie manualnych testów eksploracyjnych i użyteczności.
  - Zarządzanie procesem zgłaszania i śledzenia błędów.
  - Raportowanie o stanie jakości oprogramowania.
- **Właściciel Produktu / Project Manager:**
  - Definiowanie priorytetów dla testowanych funkcjonalności.
  - Udział w testach akceptacyjnych użytkownika (UAT).

---

### **10. Procedury Raportowania Błędów**

- **Narzędzie:** Wszystkie błędy będą zgłaszane i śledzone w systemie **GitHub Issues**.
- **Struktura Zgłoszenia:** Każde zgłoszenie błędu musi zawierać:
  - Tytuł: Zwięzły i jednoznaczny opis problemu.
  - Kroki do odtworzenia: Numerowana lista kroków potrzebnych do wywołania błędu.
  - Wynik oczekiwany: Co powinno się wydarzyć.
  - Wynik rzeczywisty: Co się wydarzyło.
  - Środowisko: Wersja aplikacji, przeglądarka, system operacyjny.
  - Dowody: Zrzuty ekranu, nagrania wideo, logi z konsoli.
  - Priorytet/Waga: (np. Krytyczny, Wysoki, Średni, Niski).
- **Cykl Życia Błędu:**
  1. **Nowy:** Zgłoszony błąd oczekuje na analizę.
  2. **W Analizie:** Błąd jest weryfikowany i przypisywany do dewelopera.
  3. **W Trakcie Naprawy:** Deweloper pracuje nad rozwiązaniem.
  4. **Gotowy do Testów:** Błąd został naprawiony i jest gotowy do weryfikacji przez QA.
  5. **Zamknięty:** Błąd został pomyślnie zweryfikowany.
  6. **Otwarty Ponownie:** Weryfikacja nie powiodła się, błąd wraca do dewelopera.