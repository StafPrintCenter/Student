# Refonte du Student Portal — évolution majeure

## 1. Design & Typographie
- Remplacer "Instrument Serif" par une police plus sérieuse et institutionnelle: **Fraunces** (serif éditorial premium) pour titres et **Inter Tight** pour le corps. Chargée via `<link>` dans `__root.tsx`.
- Ajuster tokens `--font-display` et `--font-sans` dans `src/styles.css`.

## 2. Sidebar restructurée
- Déplacer **Profil** en bas de la sidebar (section dédiée avec avatar, nom, email tronqué).
- Ajouter un bouton **Déconnexion** juste sous le profil.
- Retirer l'entrée "Profil" du bloc de navigation principal.
- Ajouter nouvelle entrée **Communauté** dans la navigation.

## 3. Flux d'inscription verrouillé par paiement (¼ minimum)
- Modifier `trainingApi.enroll`: crée l'inscription en statut `awaiting_initial_payment`.
- Nouvelle règle: **le détail complet du cours (modules, leçons, quiz, exercices) n'est accessible que si `amount_paid ≥ price * 0.25`**.
- Sinon, `_portal.trainings.$id.tsx` affiche un écran verrouillé "Débloquez la formation" avec:
  - Résumé du programme (titre, objectifs, prérequis, formateur assigné) visible.
  - Bloc paiement avec: prix total, montant minimum (25%), boutons rapides **¼ / ½ / Total** + champ personnalisé (avec validation ≥ min).
  - Simulation de paiement (Mobile Money / carte) via `paymentApi.create`.
- Après paiement suffisant → détails débloqués. Affichage permanent d'un bandeau progression paiement: **payé / restant / prochaine échéance**.

## 4. Formateur assigné + validations
- Étendre `Training` avec `instructor: { name, title, avatar_seed, bio }`.
- Étendre `Lesson` avec `instructor_feedback?: { note?: number; comment: string; validated: boolean; at: string }` pour quiz/exercices.
- Affichage dans le détail leçon: encart "Retour du formateur" (statut validé/en attente, note, commentaire).
- Page formation: encart "Votre formateur" en haut.

## 5. Simulations enrichies

### Vidéo
- Composant `VideoPlayer` simulé: barre de progression animée, boutons Play/Pause, timer courant/durée, contrôle vitesse, aperçu chapitrage. La progression avance en temps réel quand "Play".
- À la fin → leçon marquée complétée + progression mise à jour.

### Exercices (non chronométrés)
- Composant `ExerciseRunner`: QCM (choix unique) et **choix multiples** (checkboxes), plusieurs questions par exercice.
- Pas de timer, sauvegarde brouillon possible.
- À la soumission: score calculé, feedback par question, envoyé au formateur (statut "en attente de validation").

### Quiz (chronométrés)
- Composant `QuizRunner`: timer démarré à l'ouverture (ex: 15 min). Si non terminé à temps → **auto-submit**.
- Une fois démarré, impossible de repartir sans terminer (avertissement à la fermeture).
- **Historique des tentatives** stocké; on retient **la meilleure note** comme score officiel.
- Page dédiée "Historique du quiz" avec toutes les tentatives, date, score, durée.

## 6. Progression réelle
- La progression d'inscription est recalculée à partir des vraies interactions:
  - vidéo terminée = 100% de la leçon
  - exercice soumis = 100%
  - quiz avec meilleure note ≥ seuil (50%) = 100%
- `enrollment.progress` = pourcentage de leçons complétées / total.
- Attendance simulée en fonction de la régularité (sessions ouvertes).

## 7. Rappels de paiement
- Générateur de notifications automatique (au montage du dashboard):
  - Si `amount_due > 0` **et** date fin < 15 jours → notification "Paiement restant à régler".
  - Si `progress ≥ 50%` **et** `amount_due > 0` → notification "Vous avez atteint 50%, pensez à régler le solde".
- Bandeau discret sur le dashboard listant ces rappels.

## 8. Espace Communauté
- Nouvelle route `_portal.community.tsx`.
- Fonctionnalités:
  - Fil de discussions (mockées) par formation ou général.
  - Créer un post (titre + contenu), commenter, liker.
  - Filtre par formation, badge du formateur, badge "nouveau".
  - Membres en ligne (mock).
- Données mock dans `mock-data.ts` (`COMMUNITY_POSTS`).

## 9. Améliorations UX de l'espace d'apprentissage
- Détail formation redessiné: header avec cover, progression globale, formateur, prochaine leçon **Continuer**.
- Timeline verticale des modules avec indicateurs (verrouillé / en cours / complété).
- Raccourcis clavier basiques (Esc ferme dialogs — déjà OK).
- Toasts sur actions clés (paiement, soumission, quiz auto-terminé).

## Détails techniques

### Fichiers créés
- `src/components/portal/video-player.tsx`
- `src/components/portal/exercise-runner.tsx`
- `src/components/portal/quiz-runner.tsx`
- `src/components/portal/payment-dialog.tsx` (réutilisable, presets ¼/½/total/custom)
- `src/components/portal/instructor-card.tsx`
- `src/routes/_portal.community.tsx`

### Fichiers modifiés
- `src/lib/api/types.ts` — ajout `instructor`, `QuizAttempt`, `Post`, statut `awaiting_initial_payment`.
- `src/lib/api/mock-data.ts` — formateurs, feedbacks, posts communauté.
- `src/lib/api/index.ts` — `trainingApi.enroll`, `submitQuiz`, `submitExercise`, `completeLesson`, `communityApi`.
- `src/lib/api/utils.ts` — helper `hasUnlockedAccess(enrollment, training)`.
- `src/routes/__root.tsx` — <link> Google Fonts Fraunces + Inter Tight.
- `src/styles.css` — nouvelles variables font.
- `src/components/portal/layout.tsx` — sidebar restructurée (profil + logout en bas, communauté ajoutée, Profil retiré du menu principal).
- `src/routes/_portal.trainings.$id.tsx` — verrouillage, formateur, nouveaux runners, historique quiz.
- `src/routes/_portal.dashboard.tsx` — rappels paiement.
- `src/routes/_portal.progress.tsx` — calcul basé sur vraies données.

### Persistance mock
- État partagé in-memory dans `src/lib/api/index.ts` (déjà en place). Tentatives quiz stockées dans un tableau `quizAttempts[]`, sélection de la meilleure note pour l'affichage.
