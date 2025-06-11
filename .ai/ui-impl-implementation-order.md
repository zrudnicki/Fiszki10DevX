# Rekomendowana kolejność implementacji UI

Poniższa kolejność została zaplanowana tak, aby umożliwić iteracyjne wdrażanie i testowanie funkcjonalności w przeglądarce po każdym większym etapie.

## Faza 1: Fundamenty i podstawowe zarządzanie treścią
Celem tej fazy jest zbudowanie szkieletu aplikacji i umożliwienie tworzenia podstawowych zasobów (kolekcji).

1.  **Logowanie / Rejestracja (`ui-impl-login-view-implementation-plan.md`)**
    *   **Uzasadnienie**: To absolutna podstawa. Bez możliwości logowania i rejestracji, żadna inna zabezpieczona funkcjonalność nie będzie dostępna do testowania.

2.  **Panel Główny (`ui-impl-dashboard-view-implementation-plan.md`)**
    *   **Uzasadnienie**: Jest to centralny hub nawigacyjny. Po zalogowaniu użytkownik musi gdzieś wylądować. Ten widok zapewni linki do przyszłych funkcjonalności.

3.  **Zarządzanie Kolekcjami (Pełen CRUD)**
    *   **3a. Lista Kolekcji (`ui-impl-collections-list-view-implementation-plan.md`)**
    *   **3b. Formularz Tworzenia/Edycji Kolekcji (`ui-impl-collection-form-view-implementation-plan.md`)**
    *   **Uzasadnienie**: Kolekcje są podstawowym kontenerem na fiszki. Zaimplementowanie pełnego CRUD dla kolekcji pozwoli na przetestowanie kluczowego cyklu życia zasobu (tworzenie, listowanie, edycja, usuwanie) i przygotuje grunt pod dodawanie do nich fiszek.

> **Kamień milowy 1**: Po tej fazie można zalogować się, zobaczyć pulpit, wejść w zarządzanie kolekcjami, dodać nową kolekcję, zobaczyć ją na liście, edytować jej nazwę i ją usunąć. Cały przepływ jest weryfikowalny.

---

## Faza 2: Rdzeń aplikacji - fiszki
Celem tej fazy jest wdrożenie głównej propozycji wartości aplikacji - tworzenia i zarządzania fiszkami.

4.  **Ręczne Tworzenie Fiszki (`ui-impl-manual-flashcard-form-view-implementation-plan.md`)**
    *   **Uzasadnienie**: To najprostszy sposób na dodanie fiszek do systemu. Zależy od istnienia kolekcji, które zostały zaimplementowane w poprzedniej fazie.

5.  **Szczegóły Kolekcji z listą fiszek (`ui-impl-collection-details-view-implementation-plan.md`)**
    *   **Uzasadnienie**: Niezbędne, aby zobaczyć efekt dodania fiszki. Ten widok jest kluczowy do weryfikacji, czy fiszka została poprawnie utworzona i przypisana do kolekcji.

6.  **Edycja Fiszki (`ui-impl-flashcard-edit-form-view-implementation-plan.md`)**
    *   **Uzasadnienie**: Domyka podstawowy cykl CRUD dla fiszek, pozwalając na ich modyfikację.

> **Kamień milowy 2**: Użytkownik może w pełni zarządzać swoimi fiszkami w sposób manualny. Może je tworzyć, przeglądać w kontekście kolekcji, edytować i usuwać.

---

## Faza 3: Funkcje zaawansowane i wspomagające
Po zbudowaniu solidnych podstaw, można przejść do bardziej złożonych i wspomagających funkcjonalności.

7.  **Generowanie Fiszek AI (oba widoki)**
    *   **7a. Formularz Generowania (`ui-impl-ai-generate-form-view-implementation-plan.md`)**
    *   **7b. Widok Recenzji (`ui-impl-ai-review-view-implementation-plan.md`)**
    *   **Uzasadnienie**: To złożona, wieloetapowa funkcja, która w pełni zależy od działającego systemu kolekcji i fiszek.

8.  **Sesja Nauki (`ui-impl-study-session-view-implementation-plan.md`)**
    *   **Uzasadnienie**: Główna funkcja "użytkowa" aplikacji. Wymaga istnienia fiszek w bazie danych, które można pobrać do nauki.

9.  **Zarządzanie Kategoriami (`ui-impl-category-management-view-implementation-plan.md`)**
    *   **Uzasadnienie**: Jest to funkcja pomocnicza. Jej implementacja będzie znacznie szybsza, bazując na istniejących już rozwiązaniach dla kolekcji. Można ją wdrożyć w dowolnym momencie po Fazie 1.

> **Kamień milowy 3**: Aplikacja jest w pełni funkcjonalna i realizuje wszystkie kluczowe historyjki użytkownika.

---

## Faza 4: Wykończenie
Ostatnie elementy, które uzupełniają aplikację.

10. **Statystyki (`ui-impl-statistics-view-implementation-plan.md`)**
    *   **Uzasadnienie**: Najlepiej implementować na końcu, gdy w systemie znajdują się już dane z sesji nauki i generowania AI, co pozwoli na natychmiastową weryfikację poprawności wyświetlanych metryk.

11. **Ustawienia i Usuwanie Konta (`ui-impl-account-settings-view-implementation-plan.md`)**
    *   **Uzasadnienie**: Ważna, ale odizolowana funkcjonalność. Nie ma wpływu na inne części aplikacji, więc można ją bezpiecznie zaimplementować na końcu. 