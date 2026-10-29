import type { CommunityPost } from "./types";
import { daysFromNow, uuid } from "./utils";

// ---- Community ----
export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    uuid: "post-01",
    author: "Séraphin Houngbédji",
    author_role: "instructor",
    training_uuid: "tr-graphic-01",
    title: "Bienvenue à la promotion Design Graphique !",
    body:
      "Ravi de vous accueillir. Postez ici vos brouillons, questions et références. Un retour hebdo tous les vendredis.",
    created_at: daysFromNow(-10),
    likes: 12,
    liked: false,
    replies: [
      { uuid: uuid(), author: "Amina Adjovi", author_role: "student", body: "Hâte de démarrer !", at: daysFromNow(-9) },
      { uuid: uuid(), author: "Kader Sossa", author_role: "student", body: "Merci Séraphin 🙌", at: daysFromNow(-9) },
    ],
    tags: ["annonce"],
  },
  {
    uuid: "post-02",
    author: "Kader Sossa",
    author_role: "student",
    training_uuid: "tr-graphic-01",
    title: "Retour sur mon exercice de mise en page",
    body:
      "J'ai testé la grille modulaire sur mon poster. Est-ce que la hiérarchie fonctionne pour vous ?",
    created_at: daysFromNow(-3),
    likes: 5,
    liked: true,
    replies: [
      { uuid: uuid(), author: "Amina Adjovi", author_role: "student", body: "Le titre pourrait respirer davantage.", at: daysFromNow(-2) },
    ],
    tags: ["exercice", "feedback"],
  },
  {
    uuid: "post-03",
    author: "Reine Aholou",
    author_role: "instructor",
    training_uuid: "tr-print-02",
    title: "Rappel : examen colorimétrie vendredi",
    body: "Révisez surtout les profils ICC et la surimpression. Bonne chance !",
    created_at: daysFromNow(-1),
    likes: 8,
    liked: false,
    replies: [],
    tags: ["rappel"],
  },
  {
    uuid: "post-04",
    author: "Amina Adjovi",
    author_role: "student",
    title: "Quelqu'un pour un binôme sur le projet identité ?",
    body: "Je cherche un partenaire pour échanger sur nos plateformes de marque avant la remise.",
    created_at: daysFromNow(-2),
    likes: 3,
    liked: false,
    replies: [],
    tags: ["collaboration"],
  },
];
