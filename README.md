# ZeroWait App

## Setup

```bash
# 1. Dependencies installieren
npm install

# 2. App starten
npx expo start
```

## Supabase einrichten

1. Gehe auf https://supabase.com und erstelle ein neues Projekt
2. Kopiere deine Project URL und Anon Key
3. Trage sie in `src/lib/supabaseClient.ts` ein

### SQL für Tabellen (in Supabase SQL Editor einfügen):

```sql
create table machines (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  location text,
  image_url text,
  status text default 'available'
);

create table reservations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  machine_id uuid references machines(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  checked_in boolean default false,
  created_at timestamptz default now()
);

create table workout_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  exercise_name text not null,
  weight_kg numeric not null,
  reps integer not null,
  sets integer not null,
  logged_at timestamptz default now()
);

create table suggestions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  prompt text,
  response_text text,
  created_at timestamptz default now()
);
```

## Claude API (für Suggestion Screen)

1. Gehe auf https://console.anthropic.com
2. Erstelle einen API Key
3. Trage ihn in `src/lib/claudeApi.ts` ein

## Screens

| Screen | Datei | Status |
|--------|-------|--------|
| Home | HomeScreen.tsx | ✅ Fertig |
| Maschinen Liste | MachineListScreen.tsx | 🔲 TODO |
| Maschinen Detail | MachineDetailScreen.tsx | 🔲 TODO |
| Zeitslot wählen | TimeSlotScreen.tsx | 🔲 TODO |
| Buchung bestätigen | BookingConfirmScreen.tsx | 🔲 TODO |
| Buchung Erfolg | BookingSuccessScreen.tsx | 🔲 TODO |
| Meine Buchungen | ReservationsScreen.tsx | 🔲 TODO |
| Buchung Detail | BookingDetailScreen.tsx | 🔲 TODO |
| Check-in | CheckInScreen.tsx | 🔲 TODO |
| AI Suggestion | SuggestionScreen.tsx | 🔲 TODO |
| Fortschritt | WorkoutProgressScreen.tsx | 🔲 TODO |
