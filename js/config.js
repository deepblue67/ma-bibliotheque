// Configuration Supabase — clé "anon" uniquement (publique par nature, prévue pour
// être utilisée côté client). La clé "service_role" ne doit JAMAIS apparaître ici.
//
// Depuis la 3.0, cette clé ne permet plus que de lire le catalogue : les règles de la base
// (migration_2026-11_securite.sql) réservent toute modification, ainsi que les statuts et
// avis, au propriétaire connecté (Réglages → Mode propriétaire → Connexion sécurisée).
// L'ancienne empreinte du code propriétaire (ownerHash) a été retirée en 3.1 : elle ne sert plus.
window.SUPABASE_CONFIG = {
  url: "https://nyobnumwltjdzlkbhrrv.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b2JudW13bHRqZHpsa2JocnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNjEzNDYsImV4cCI6MjEwMzkzNzM0Nn0.uGwQFenKhFCIolKLzQ-rEE5iT-ZfVcQOkh5X80eQLs4",
  coversBucket: "covers"
};
