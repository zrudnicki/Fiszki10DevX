# Plan implementacji widoku Ustawień Konta

## 1. Przegląd

Ten widok jest miejscem, gdzie użytkownik może zarządzać ustawieniami swojego konta. W obecnej wersji MVP, główną i jedyną funkcją jest możliwość permanentnego usunięcia konta. Jest to krytyczna operacja, która musi być odpowiednio zabezpieczona przed przypadkowym użyciem.

## 2. Routing widoku

- **Ścieżka**: `/dashboard/account`

## 3. Struktura komponentów

```
- AccountSettingsPage.astro
  - Layout.astro
    - Main
      - Header (H1 "Ustawienia konta")
      - Card (Informacje o koncie, np. email)
      - DeleteAccountSection.tsx (Astro Island, client:load)
        - Card (wariant "destructive")
          - CardHeader (H2 "Strefa zagrożenia")
          - CardContent (Opis konsekwencji usunięcia konta)
          - CardFooter
            - Button (variant="destructive", "Usuń konto")
        - AlertDialog (Shadcn, do potwierdzenia)
          - AlertDialogContent
            - Wymaganie wpisania frazy "USUŃ" w Input
            - Button (finalne usunięcie, disabled domyślnie)
```

## 4. Szczegóły komponentów

### `AccountSettingsPage.astro`

- **Opis komponentu**: Strona Astro, która wyświetla podstawowe informacje o koncie i renderuje interaktywną sekcję usuwania.
- **Główne elementy**: `Layout`, `DeleteAccountSection`.
- **Logika `---`**: Pobiera email zalogowanego użytkownika z `Astro.locals.user.email` i wyświetla go.

### `DeleteAccountSection.tsx`

- **Opis komponentu**: Interaktywny komponent React, który obsługuje cały proces usuwania konta.
- **Główne elementy**: `Button`, `AlertDialog`, `Input` (wewnątrz modala).
- **Obsługiwane interakcje**:
  - Kliknięcie "Usuń konto" -> otwiera `AlertDialog`.
  - Wpisywanie tekstu w polu `Input` w modalu.
  - Kliknięcie finalnego przycisku usunięcia.
- **Propsy**: Brak.

## 5. Typy

Nie są wymagane żadne nowe typy.

## 6. Zarządzanie stanem

- Stan jest zarządzany lokalnie wewnątrz `DeleteAccountSection.tsx`.
- Wymagany stan (`useState`):
  - `isAlertOpen: boolean` - kontroluje widoczność `AlertDialog`.
  - `confirmationText: string` - przechowuje tekst wpisywany przez użytkownika w modalu.
  - `isSubmitting: boolean` - do obsługi stanu ładowania przycisku.

## 7. Integracja API

- Integracja odbywa się po stronie klienta w `DeleteAccountSection.tsx`.
- Docelowo powinien istnieć dedykowany endpoint `DELETE /api/account` lub podobny, który jest wywoływany z klienta. Endpoint ten musi mieć uprawnienia do usunięcia użytkownika z Supabase Auth i wszystkich jego danych.
- **Wywołanie**: `fetch('/api/account', { method: 'DELETE' })`.
- **Typ odpowiedzi**: `200 OK` lub `204 No Content`.

## 8. Interakcje użytkownika

1. **Inicjacja**: Użytkownik klika przycisk "Usuń konto".
2. **Potwierdzenie**: Otwiera się modal z ostrzeżeniem. Użytkownik musi wpisać określoną frazę (np. "USUŃ"), aby odblokować finalny przycisk.
3. **Finalizacja**: Użytkownik klika odblokowany przycisk.
   - **Sukces**: Wywoływane jest API. Po pomyślnej odpowiedzi, użytkownik jest programowo wylogowywany (np. przez `supabase.auth.signOut()`) i przekierowywany na stronę główną (`/`).
   - **Błąd**: Wyświetlany jest komunikat o błędzie wewnątrz modala.

## 9. Warunki i walidacja

- **Warunek w modalu**: Finalny przycisk usunięcia jest `disabled`, dopóki `confirmationText` nie jest równy wymaganej frazie (np. `'USUŃ'`).

## 10. Obsługa błędów

- **Błąd API**: Jeśli `fetch` do usunięcia konta zwróci błąd, należy wyświetlić komunikat w `AlertDialog` (np. "Nie udało się usunąć konta. Spróbuj ponownie.") i nie zamykać modala.

## 11. Kroki implementacji

1. Stworzyć endpoint API `src/pages/api/account/index.ts`, który będzie obsługiwał metodę `DELETE`. Logika tego endpointu musi wywołać funkcję admina Supabase do usunięcia użytkownika (`supabase.auth.admin.deleteUser(userId)`). To wymaga klucza `SERVICE_ROLE`.
2. Stworzyć plik `src/pages/dashboard/account.astro`.
3. Użyć na stronie `Layout` i wyświetlić email użytkownika.
4. Stworzyć komponent-wyspę `src/components/account/DeleteAccountSection.tsx`.
5. Umieścić komponent na stronie `account.astro`.
6. W `DeleteAccountSection.tsx` zaimplementować `Card` z przyciskiem oraz `AlertDialog` z Shadcn.
7. Zaimplementować logikę stanu do zarządzania widocznością modala i tekstem potwierdzenia.
8. Zaimplementować logikę `disabled` dla finalnego przycisku usuwania.
9. Zaimplementować funkcję `handleDelete`, która wywołuje `fetch` do nowo utworzonego endpointu API.
10. Po pomyślnym usunięciu, wywołać `supabase.auth.signOut()` i przekierować użytkownika za pomocą `window.location.href`.
11. Dodać obsługę błędów.
