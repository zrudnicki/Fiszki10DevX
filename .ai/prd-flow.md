# Diagram przepływu funkcjonalności aplikacji Fiszki

## Diagram

```mermaid
flowchart TD
    Start["/Strona główna/"] --> Login["Logowanie/Rejestracja"]
    Login --> Dashboard["Panel użytkownika"]
    
    Dashboard --> GenerateAI["Generowanie fiszek przez AI"]
    Dashboard --> CreateManual["Ręczne tworzenie fiszek"]
    Dashboard --> Collections["Zarządzanie kolekcjami"]
    Dashboard --> Review["Sesja nauki"]
    Dashboard --> Stats["Statystyki"]
    Dashboard --> Account["Zarządzanie kontem"]
    
    GenerateAI --> |"Wprowadź tekst"| AIProcessing["Przetwarzanie AI"]
    AIProcessing --> |"5-15 fiszek"| ReviewAI["Recenzja wygenerowanych fiszek"]
    ReviewAI --> |"Akceptuj/Edytuj"| SaveCards["Zapisywanie fiszek"]
    
    CreateManual --> |"Wypełnij formularz"| SaveCards
    SaveCards --> Collections
    
    Collections --> Review
    Review --> |"Przyswojone"| UpdateProgress["Aktualizacja postępu"]
    Review --> |"Do powtórki"| UpdateProgress
    UpdateProgress --> Stats
    
    Account --> |"Usuń konto"| DeleteConfirm["Potwierdzenie usunięcia"]
    DeleteConfirm --> |"Potwierdź"| Start
    
    subgraph "Generowanie fiszek"
        GenerateAI
        CreateManual
        AIProcessing
        ReviewAI
    end
    
    subgraph "Nauka"
        Review
        UpdateProgress
    end
    
    subgraph "Zarządzanie"
        Collections
        Stats
        Account
    end
```

## Opis przepływu

### 1. Rozpoczęcie pracy
- Użytkownik rozpoczyna od strony głównej
- Wymagane jest zalogowanie się lub rejestracja przez Supabase
- Po zalogowaniu użytkownik trafia do panelu użytkownika

### 2. Generowanie fiszek
#### Ścieżka AI
1. Użytkownik wybiera opcję generowania przez AI
2. Wprowadza tekst (1000-10000 znaków)
3. AI generuje 5-15 propozycji fiszek
4. Użytkownik recenzuje każdą fiszkę:
   - Akceptuje bez zmian
   - Edytuje i akceptuje
   - Odrzuca

#### Ścieżka manualna
1. Użytkownik wybiera ręczne tworzenie
2. Wypełnia formularz (Front ≤200 znaków, Back ≤500 znaków)
3. Fiszka jest zapisywana w kolekcji

### 3. Nauka
1. Użytkownik wybiera kolekcję do nauki
2. System prezentuje fiszki według algorytmu powtórek
3. Dla każdej fiszki użytkownik oznacza:
   - "Przyswojone" - zwiększa interwał powtórki
   - "Wymaga powtórki" - resetuje interwał
4. System aktualizuje statystyki nauki

### 4. Zarządzanie
#### Kolekcje
- Organizacja fiszek w zestawy
- Możliwość edycji i usuwania fiszek
- Przeglądanie postępów per kolekcja

#### Statystyki
- Śledzenie skuteczności generowania AI
- Monitorowanie czasu nauki
- Analiza postępów

#### Konto
- Zarządzanie danymi użytkownika
- Możliwość usunięcia konta z potwierdzeniem
- Zgodność z RODO

## Metryki sukcesu
1. **Generowanie AI**
   - 75% wygenerowanych fiszek jest akceptowanych
   - 75% wszystkich fiszek pochodzi z AI

2. **Efektywność nauki**
   - Średni czas przeglądu < 2 minuty na sesję 