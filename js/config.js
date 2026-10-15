// Configuration Supabase — clé "anon" uniquement (publique par nature, prévue pour
// être utilisée côté client). La clé "service_role" ne doit JAMAIS apparaître ici.
window.SUPABASE_CONFIG = {
  url: "https://nyobnumwltjdzlkbhrrv.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b2JudW13bHRqZHpsa2JocnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNjEzNDYsImV4cCI6MjEwMzkzNzM0Nn0.uGwQFenKhFCIolKLzQ-rEE5iT-ZfVcQOkh5X80eQLs4",
  coversBucket: "covers",

  // Empreinte SHA-256 du code du mode propriétaire.
  //
  // Tant que cette valeur est vide, PERSONNE ne peut corriger un titre ni
  // masquer une fiche depuis l'application — c'est volontaire : l'app est
  // publique, mieux vaut qu'elle soit en lecture seule par défaut.
  //
  // Pour la renseigner : publie l'application, ouvre-la, va dans les réglages,
  // section « Mode propriétaire », saisis le code de ton choix et clique sur
  // « Générer l'empreinte ». Recopie ici la ligne affichée, puis redéploie.
  // Ton code lui-même n'est écrit nulle part.
  //
  // Ce n'est pas une sécurité : la clé anon ci-dessus et les droits d'écriture
  // de la base sont publics. C'est un garde-fou contre les fausses manœuvres
  // de tes visiteurs.
  ownerHash: "75427575978df4cec1e3ac9325aa756ba4381f56a675c51f13d9f02cc3553e67"
};
