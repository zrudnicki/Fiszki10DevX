# Plan implementacji widoku Logowania i Rejestracji

## 1. Przegląd

Widok ten jest bramą do aplikacji. Odpowiada za uwierzytelnienie istniejących użytkowników oraz umożliwia rejestrację nowych. Jest to kluczowy element dla bezpieczeństwa i personalizacji doświadczenia. Widok będzie wykorzystywał istniejące komponenty z `src/components/auth`, które integrują się z Supabase Auth.

## 2. Routing widoku

- **Ścieżka**: `/` lub `/login` (w zależności od konfiguracji middleware, `/` jest punktem wejścia, który może renderować ten widok lub przekierowywać do `/dashboard`, jeśli użytkownik jest zalogowany).

## 3. Struktura komponentów

```
- LoginPage.astro
  - BaseLayout.astro
    - Auth.tsx (Astro Island, client:load)
      - Card (Shadcn)
        - CardHeader (z tytułem "Zaloguj się" lub "Zarejestruj się")
        - CardContent
          - Formularz (z polami na email i hasło)
            - Input (Shadcn)
            - Label (Shadcn)
        - CardFooter
          - Button (Shadcn, przycisk "Zaloguj" lub "Zarejestruj")
          - Link (do przełączania między formularzami)
```

## 4. Szczegóły komponentów

### `LoginPage.astro`

- **Opis komponentu**: Strona Astro, która renderuje interaktywny komponent `Auth.tsx`. Odpowiada za podstawowy layout strony.
- **Główne elementy**: `BaseLayout`, komponent `<Auth client:load />`.
- **Propsy**: Brak.

### `Auth.tsx`

- **Opis komponentu**: Istniejący komponent React, który zawiera całą logikę do obsługi formularzy logowania i rejestracji, komunikację z Supabase Auth oraz przełączanie się między tymi dwoma stanami.
- **Główne elementy**: Komponenty `Card`, `Input`, `Button` z Shadcn/ui do zbudowania interfejsu.
- **Obsługiwane interakcje**:
  - Wpisywanie danych w polach `email` i `password`.
  - Kliknięcie przycisku "Zaloguj się" / "Zarejestruj się".
  - Kliknięcie linku "Nie masz konta? Zarejestruj się" (i odwrotnie).
- **Obsługiwana walidacja**:
  - **Email**: Musi być w poprawnym formacie email.
  - **Hasło**: Musi mieć co najmniej 6 znaków (wymaganie Supabase Auth).
- **Typy**: Brak DTO. Używa wewnętrznego stanu dla pól formularza.
- **Propsy**: Brak.

## 5. Typy

Nie są wymagane żadne nowe, niestandardowe typy. Komponent będzie operował na prostych typach string dla pól formularza.

## 6. Zarządzanie stanem

- Stan jest w pełni zarządzany lokalnie wewnątrz komponentu `Auth.tsx`.
- `useState` jest używany do:
  - Przechowywania aktualnej wartości pól `email` i `password`.
  - Przechowywania stanu widoku (`'signIn'` lub `'signUp'`).
  - Przechowywania komunikatów o błędach.

## 7. Integracja API

- Integracja odbywa się po stronie klienta wewnątrz komponentu `Auth.tsx`.
- Wykorzystywany jest klient Supabase do wywołania funkcji:
  - `supabase.auth.signInWithPassword({ email, password })`
  - `supabase.auth.signUp({ email, password })`
- **Typy żądania**: `{ email: string, password: string }`.
- **Typy odpowiedzi**: Odpowiedź z Supabase, która zawiera `data: { user, session }` i `error`.

## 8. Interakcje użytkownika

- **Logowanie**: Użytkownik wypełnia email i hasło, klika "Zaloguj się". Po pomyślnym zalogowaniu jest przekierowywany do `/dashboard`.
- **Rejestracja**: Użytkownik przełącza się na widok rejestracji, wypełnia dane, klika "Zarejestruj się". Po sukcesie jest przekierowywany do `/dashboard`.
- **Błędne dane**: W przypadku błędu (np. nieprawidłowe hasło), pod formularzem wyświetlany jest komunikat błędu zwrócony przez Supabase.

## 9. Warunki i walidacja

- **Walidacja po stronie klienta**: Podstawowa walidacja (np. czy pole nie jest puste) może być wykonana przed wysłaniem żądania.
- **Główna walidacja**: Odbywa się po stronie Supabase Auth, które zwraca błędy dotyczące formatu danych, istnienia użytkownika czy wymagań co do hasła.

## 10. Obsługa błędów

- Błędy zwrócone z `supabase.auth` (np. "Invalid login credentials") są przechwytywane w bloku `catch` lub przez sprawdzenie obiektu `error`.
- Błąd jest zapisywany w stanie komponentu i wyświetlany użytkownikowi w komponencie `Alert` pod przyciskiem akcji.

## 11. Kroki implementacji

1. Zweryfikować, czy strona `src/pages/index.astro` lub `src/pages/login.astro` istnieje i jest skonfigurowana jako strona logowania.
2. Na stronie umieścić komponent `<Auth client:load />` z `src/components/auth/Auth.tsx`.
3. Zapewnić, że strona używa podstawowego layoutu (np. `BaseLayout.astro`), który nie zawiera elementów nawigacyjnych przeznaczonych dla zalogowanych użytkowników.
4. Zaktualizować plik `src/env.d.ts`, aby rozszerzyć typ `Astro.locals` o definicje dla `supabase`, `session` i `user`. To naprawi błędy typów w middleware. Należy dodać:
   ```typescript
   declare namespace App {
     interface Locals {
       supabase: import("@supabase/supabase-js").SupabaseClient;
       session: import("@supabase/supabase-js").Session | null;
       user: import("@supabase/supabase-js").User | null;
     }
   }
   ```
5. Zmodyfikować istniejący plik `src/middleware/index.ts`, aby wdrożyć poprawną logikę przekierowań:
   - Dodać ochronę dla wszystkich ścieżek pod `/dashboard/*`. Jeśli użytkownik nie ma aktywnej sesji (`!session`), powinien zostać przekierowany na stronę główną (`/`).
   - Poprawić istniejącą logikę tak, aby zalogowany użytkownik (`session`) próbujący wejść na stronę główną (`/`) lub logowania (`/login`), był automatycznie przekierowywany do swojego panelu (`/dashboard`).
6. Przetestować przepływ logowania, rejestracji i obsługi błędów, włączając w to próby dostępu do chronionych stron jako użytkownik niezalogowany i zalogowany.
