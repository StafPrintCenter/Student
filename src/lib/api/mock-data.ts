import type { CalendarEvent, Certificate, CommunityPost, Enrollment, Instructor, NotificationItem, Payment, QuizQuestion, Student, StudentDocument, SupportTicket, Training, Module, Lesson } from "./types";
import { daysFromNow, nowISO, uuid } from "./utils";

const base = () => ({
  uuid: uuid(),
  created_at: nowISO(),
  updated_at: nowISO(),
  deleted_at: null,
  is_enabled: true,
});

// ---- Student ----
export const STUDENT: Student = {
  ...base(),
  uuid: "stu-001",
  first_name: "Steve Aster",
  last_name: "AFOVO",
  email: "steveasterafovo@gmail.com",
  phone: "+229 01 66 52 36 39",
  address: "Porto-Novo, Bénin",
  occupation: "Graphiste senior",
  birth_date: "1996-02-05",
  biography: "Passionnée par la typographie et l'édition, en formation pour devenir directrice artistique.",
  emergency_contact: "Koffi Adjovi — +229 01 43 22 07 00",
  photo_url: "",
};

// ---- Instructors ----
export const INSTRUCTORS: Record<string, Instructor> = {
  seraphin: {
    uuid: "ins-01",
    name: "Séraphin Houngbédji",
    title: "Directeur artistique · STAF",
    bio: "15 ans d'expérience en identité de marque et édition print. Ancien AD chez Studio Amaka.",
    avatar_seed: "seraphin",
  },
  reine: {
    uuid: "ins-02",
    name: "Reine Aholou",
    title: "Chef de fabrication",
    bio: "Spécialiste des chaînes offset et numérique, formatrice technique.",
    avatar_seed: "reine",
  },
  jonas: {
    uuid: "ins-03",
    name: "Jonas Kponou",
    title: "Motion designer",
    bio: "Motion designer freelance, il anime pour marques et institutions.",
    avatar_seed: "jonas",
  },
};

// ---- Lessons / Modules helper ----
function mk_lesson(partial: Partial<Lesson> & Pick<Lesson, "title" | "kind" | "duration_minutes" | "completed">): Lesson {
  return {
    ...base(),
    uuid: uuid(),
    score: undefined,
    ...partial,
  } as Lesson;
}
function mk_module(title: string, lessons: Lesson[]): Module {
  return { ...base(), uuid: uuid(), title, lessons };
}

// ---- Standard quiz/exercise question banks ----
const QZ_TYPO: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Qu'appelle-t-on la « chasse » d'un caractère typographique ?",
    choices: [
      "La hauteur des majuscules",
      "La largeur horizontale du glyphe",
      "L'inclinaison italique",
      "L'épaisseur du trait",
    ],
    correct: [1],
    multi: false,
  },
  {
    id: "q2",
    prompt: "Parmi ces polices, lesquelles sont des serif ?",
    choices: ["Garamond", "Futura", "Fraunces", "Helvetica"],
    correct: [0, 2],
    multi: true,
  },
  {
    id: "q3",
    prompt: "L'interlignage optimal pour un texte courant se situe généralement entre :",
    choices: ["80 % et 100 %", "120 % et 145 %", "160 % et 200 %", "200 % et 250 %"],
    correct: [1],
    multi: false,
  },
  {
    id: "q4",
    prompt: "Une hiérarchie typographique repose sur… (plusieurs réponses)",
    choices: ["La taille", "La graisse", "La couleur", "Le nombre de mots"],
    correct: [0, 1, 2],
    multi: true,
  },
];

const QZ_COLOR: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Un profil ICC sert à…",
    choices: [
      "Compresser un PDF",
      "Décrire l'espace colorimétrique d'un périphérique",
      "Ajouter du grain à une image",
      "Convertir un RVB en CMJN sans perte",
    ],
    correct: [1],
    multi: false,
  },
  {
    id: "q2",
    prompt: "Quels espaces colorimétriques utilise-t-on couramment en print ?",
    choices: ["CMJN", "sRGB", "Pantone", "HSL"],
    correct: [0, 2],
    multi: true,
  },
  {
    id: "q3",
    prompt: "La surimpression du noir 100 % permet de…",
    choices: [
      "Éviter les défauts de repérage",
      "Économiser de l'encre",
      "Augmenter la brillance",
      "Rendre la couleur plus vive",
    ],
    correct: [0],
    multi: false,
  },
];

const EX_LAYOUT: QuizQuestion[] = [
  {
    id: "e1",
    prompt: "Quelles règles guident une bonne grille de mise en page ?",
    choices: [
      "Cohérence des marges",
      "Alignements francs",
      "Nombreuses polices différentes",
      "Modularité",
    ],
    correct: [0, 1, 3],
    multi: true,
  },
  {
    id: "e2",
    prompt: "Un rythme visuel se crée principalement grâce à :",
    choices: ["Le hasard", "La répétition d'éléments", "L'usage exclusif du gras", "Les majuscules"],
    correct: [1],
    multi: false,
  },
  {
    id: "e3",
    prompt: "Le blanc tournant dans une mise en page…",
    choices: [
      "Aère le contenu",
      "Guide l'œil",
      "Est du gaspillage d'espace",
      "Structure la lecture",
    ],
    correct: [0, 1, 3],
    multi: true,
  },
];

// Placeholder simulated video URL (used only for label / progress simulation).
const SIM_VIDEO = "video://staf.simulated";

// ---- Trainings ----
export const TRAININGS: Training[] = [
  {
    ...base(),
    uuid: "tr-graphic-01",
    slug: "design-graphique-fondamentaux",
    title: "Design Graphique — Fondamentaux",
    theme: "Design",
    level: "Débutant",
    description:
      "Maîtrisez les bases du design graphique : composition, typographie, couleur et outils du métier (Illustrator, Photoshop, InDesign).",
    objectives: [
      "Comprendre les principes fondamentaux de la composition",
      "Maîtriser la hiérarchie typographique",
      "Construire une identité visuelle cohérente",
      "Livrer un projet imprimé prêt pour la presse",
    ],
    prerequisites: ["Ordinateur personnel", "Motivation créative"],
    duration: "8 semaines",
    duration_hours: 64,
    price: 250000,
    registration_fee: 25000,
    registration_deadline: daysFromNow(10),
    start_date: daysFromNow(14),
    end_date: daysFromNow(12),
    instructor: "Séraphin Houngbédji",
    instructor_profile: INSTRUCTORS.seraphin,
    location: "STAF Print Center — Cotonou",
    maximum_students: 20,
    current_students: 14,
    waiting_list_enabled: true,
    enrollment_status: "open",
    published_at: nowISO(),
    cover_color: "oklch(0.72 0.16 55)",
    next_session: daysFromNow(2),
    modules: [
      mk_module("Fondations visuelles", [
        mk_lesson({
          title: "Bienvenue & panorama des outils",
          kind: "video",
          duration_minutes: 12,
          completed: true,
          video_url: SIM_VIDEO,
          chapters: [
            { at: 0, label: "Introduction" },
            { at: 180, label: "Outils Adobe" },
            { at: 480, label: "Workflow" },
          ],
        }),
        mk_lesson({
          title: "Grilles et composition",
          kind: "video",
          duration_minutes: 18,
          completed: true,
          video_url: SIM_VIDEO,
          chapters: [
            { at: 0, label: "Principes" },
            { at: 300, label: "Exemples éditoriaux" },
          ],
        }),
        mk_lesson({
          title: "Exercice : diagnostiquer une mise en page",
          kind: "exercise",
          duration_minutes: 25,
          completed: true,
          score: 85,
          questions: EX_LAYOUT,
          instructor_feedback: {
            note: 85,
            comment:
              "Très bonne analyse des rythmes visuels. Attention à la hiérarchie du titre secondaire.",
            validated: true,
            at: daysFromNow(-4),
          },
        }),
      ]),
      mk_module("Typographie", [
        mk_lesson({
          title: "Anatomie du caractère",
          kind: "reading",
          duration_minutes: 15,
          completed: true,
        }),
        mk_lesson({
          title: "Hiérarchie & pairage",
          kind: "video",
          duration_minutes: 22,
          completed: false,
          video_url: SIM_VIDEO,
        }),
        mk_lesson({
          title: "Quiz typographie",
          kind: "quiz",
          duration_minutes: 10,
          completed: false,
          quiz_time_limit_sec: 8 * 60,
          questions: QZ_TYPO,
        }),
      ]),
      mk_module("Projet final", [
        mk_lesson({
          title: "Brief client",
          kind: "reading",
          duration_minutes: 10,
          completed: false,
        }),
        mk_lesson({
          title: "Projet — Identité visuelle",
          kind: "project",
          duration_minutes: 240,
          completed: false,
          brief:
            "Livrez une charte graphique complète pour une marque fictive : logo, palette, typographies, applications print & digital.",
        }),
      ]),
    ],
    faq: [
      { q: "Faut-il connaître Photoshop ?", a: "Non, tout est enseigné depuis zéro." },
      { q: "Les cours sont-ils en présentiel ?", a: "Hybride : présentiel + rediffusion." },
    ],
  },
  {
    ...base(),
    uuid: "tr-print-02",
    slug: "impression-professionnelle",
    title: "Impression Professionnelle",
    theme: "Print",
    level: "Intermédiaire",
    description:
      "De la maquette au bon-à-tirer : préparez des fichiers d'impression irréprochables et pilotez votre chaîne graphique.",
    objectives: [
      "Préparer un fichier prêt pour l'impression offset & numérique",
      "Gérer les profils colorimétriques et la surimpression",
      "Communiquer efficacement avec un imprimeur",
    ],
    prerequisites: ["Bases en design graphique"],
    duration: "6 semaines",
    duration_hours: 48,
    price: 180000,
    registration_fee: 15000,
    registration_deadline: daysFromNow(-2),
    start_date: daysFromNow(-14),
    end_date: daysFromNow(10),
    instructor: "Reine Aholou",
    instructor_profile: INSTRUCTORS.reine,
    location: "STAF Print Center — Cotonou",
    maximum_students: 15,
    current_students: 15,
    waiting_list_enabled: true,
    enrollment_status: "full",
    published_at: nowISO(),
    cover_color: "oklch(0.62 0.15 155)",
    next_session: daysFromNow(4),
    modules: [
      mk_module("Chaîne graphique", [
        mk_lesson({
          title: "Panorama de l'imprimerie",
          kind: "video",
          duration_minutes: 20,
          completed: true,
          video_url: SIM_VIDEO,
        }),
        mk_lesson({
          title: "Formats & finitions",
          kind: "reading",
          duration_minutes: 18,
          completed: true,
        }),
      ]),
      mk_module("Colorimétrie", [
        mk_lesson({
          title: "Profils ICC en pratique",
          kind: "video",
          duration_minutes: 25,
          completed: false,
          video_url: SIM_VIDEO,
        }),
        mk_lesson({
          title: "Quiz colorimétrie",
          kind: "quiz",
          duration_minutes: 10,
          completed: false,
          quiz_time_limit_sec: 6 * 60,
          questions: QZ_COLOR,
        }),
      ]),
    ],
  },
  {
    ...base(),
    uuid: "tr-motion-03",
    slug: "motion-design-essentials",
    title: "Motion Design Essentials",
    theme: "Motion",
    level: "Débutant",
    description:
      "Animez vos identités visuelles : After Effects, principes d'animation et livrables pour les réseaux sociaux.",
    objectives: ["Maîtriser After Effects", "Créer un logo animé", "Exporter pour le web"],
    prerequisites: ["Aucun"],
    duration: "5 semaines",
    duration_hours: 40,
    price: 200000,
    registration_fee: 20000,
    registration_deadline: daysFromNow(20),
    start_date: daysFromNow(25),
    end_date: daysFromNow(60),
    instructor: "Jonas Kponou",
    instructor_profile: INSTRUCTORS.jonas,
    location: "En ligne",
    maximum_students: 25,
    current_students: 8,
    waiting_list_enabled: false,
    enrollment_status: "open",
    published_at: nowISO(),
    cover_color: "oklch(0.62 0.12 235)",
    modules: [
      mk_module("Introduction", [
        mk_lesson({
          title: "Interface After Effects",
          kind: "video",
          duration_minutes: 18,
          completed: false,
          video_url: SIM_VIDEO,
        }),
      ]),
    ],
  },
  {
    ...base(),
    uuid: "tr-branding-04",
    slug: "branding-strategie-visuelle",
    title: "Branding & Stratégie Visuelle",
    theme: "Branding",
    level: "Avancé",
    description:
      "Construisez des marques cohérentes et désirables, du positionnement au design system.",
    objectives: ["Définir un positionnement", "Livrer une charte", "Créer un design system"],
    prerequisites: ["1 an d'expérience minimum"],
    duration: "10 semaines",
    duration_hours: 80,
    price: 420000,
    registration_fee: 30000,
    registration_deadline: daysFromNow(-30),
    start_date: daysFromNow(-90),
    end_date: daysFromNow(-20),
    instructor: "Séraphin Houngbédji",
    instructor_profile: INSTRUCTORS.seraphin,
    location: "STAF Print Center — Cotonou",
    maximum_students: 12,
    current_students: 12,
    waiting_list_enabled: false,
    enrollment_status: "closed",
    published_at: nowISO(),
    cover_color: "oklch(0.6 0.18 340)",
    modules: [
      mk_module("Positionnement", [
        mk_lesson({
          title: "Discovery client",
          kind: "video",
          duration_minutes: 22,
          completed: true,
          video_url: SIM_VIDEO,
        }),
        mk_lesson({
          title: "Projet final",
          kind: "project",
          duration_minutes: 300,
          completed: true,
          score: 92,
          brief: "Livrez une plateforme de marque complète pour un client.",
          instructor_feedback: {
            note: 92,
            comment: "Excellent travail, positionnement clair et système visuel cohérent.",
            validated: true,
            at: daysFromNow(-25),
          },
        }),
      ]),
    ],
  },
];

// ---- Enrollments ----
export const ENROLLMENTS: Enrollment[] = [
  {
    ...base(),
    uuid: "en-01",
    training_uuid: "tr-graphic-01",
    student_uuid: "stu-001",
    enrolled_at: daysFromNow(-20),
    expected_completion: daysFromNow(60),
    status: "in_progress",
    progress: 42,
    attendance: 88,
    payment_status: "partial",
    certificate_status: "not_eligible",
    amount_paid: 150000,
    amount_due: 100000,
  },
  {
    ...base(),
    uuid: "en-02",
    training_uuid: "tr-print-02",
    student_uuid: "stu-001",
    enrolled_at: daysFromNow(-30),
    expected_completion: daysFromNow(20),
    status: "waiting_payment",
    progress: 15,
    attendance: 75,
    payment_status: "overdue",
    certificate_status: "not_eligible",
    amount_paid: 15000,
    amount_due: 165000,
  },
  {
    ...base(),
    uuid: "en-03",
    training_uuid: "tr-branding-04",
    student_uuid: "stu-001",
    enrolled_at: daysFromNow(-120),
    expected_completion: daysFromNow(-15),
    status: "completed",
    progress: 100,
    attendance: 96,
    payment_status: "paid",
    certificate_status: "issued",
    amount_paid: 420000,
    amount_due: 0,
  },
];

// ---- Payments ----
export const PAYMENTS: Payment[] = [
  {
    ...base(), uuid: "pay-01", enrollment_uuid: "en-01", training_uuid: "tr-graphic-01",
    amount: 100000, method: "mobile_money", reference: "MTN-88291122",
    status: "paid", paid_at: daysFromNow(-15), invoice_url: "#", receipt_url: "#",
  },
  {
    ...base(), uuid: "pay-02", enrollment_uuid: "en-01", training_uuid: "tr-graphic-01",
    amount: 50000, method: "card", reference: "VISA-7712",
    status: "paid", paid_at: daysFromNow(-5),
  },
  {
    ...base(), uuid: "pay-03", enrollment_uuid: "en-02", training_uuid: "tr-print-02",
    amount: 15000, method: "cash", reference: "CASH-0021",
    status: "paid", paid_at: daysFromNow(-25),
  },
  {
    ...base(), uuid: "pay-04", enrollment_uuid: "en-03", training_uuid: "tr-branding-04",
    amount: 420000, method: "bank_transfer", reference: "BOA-9981",
    status: "paid", paid_at: daysFromNow(-100),
  },
];

// ---- Certificates ----
export const CERTIFICATES: Certificate[] = [
  {
    ...base(), uuid: "cert-01", training_uuid: "tr-branding-04",
    training_title: "Branding & Stratégie Visuelle",
    number: "STAF-2025-BRD-0142", issued_at: daysFromNow(-10),
    status: "issued", download_url: "#",
  },
  {
    ...base(), uuid: "cert-02", training_uuid: "tr-graphic-01",
    training_title: "Design Graphique — Fondamentaux",
    number: "", issued_at: null, status: "not_eligible",
  },
];

// ---- Notifications ----
export const NOTIFICATIONS: NotificationItem[] = [
  {
    ...base(), uuid: "n-01", kind: "payment_received",
    title: "Paiement reçu",
    body: "Nous avons bien reçu votre paiement de 50 000 XOF pour Design Graphique.",
    read: false,
  },
  {
    ...base(), uuid: "n-02", kind: "payment_overdue",
    title: "Paiement en retard",
    body: "Impression Professionnelle : solde de 165 000 XOF en attente.",
    read: false, link: "/payments",
  },
  {
    ...base(), uuid: "n-03", kind: "lesson_published",
    title: "Nouvelle leçon publiée",
    body: "« Hiérarchie & pairage » est maintenant disponible.",
    read: true,
  },
  {
    ...base(), uuid: "n-04", kind: "certificate_available",
    title: "Certificat disponible",
    body: "Votre certificat Branding est prêt à être téléchargé.",
    read: true, link: "/certificates",
  },
];

// ---- Calendar ----
export const CALENDAR: CalendarEvent[] = [
  { ...base(), uuid: "ev-01", title: "Live : Hiérarchie & pairage", start: daysFromNow(2), end: daysFromNow(2), kind: "live", training_uuid: "tr-graphic-01", location: "Studio A" },
  { ...base(), uuid: "ev-02", title: "Remise projet — Identité visuelle", start: daysFromNow(9), end: daysFromNow(9), kind: "assignment", training_uuid: "tr-graphic-01" },
  { ...base(), uuid: "ev-03", title: "Examen colorimétrie", start: daysFromNow(4), end: daysFromNow(4), kind: "exam", training_uuid: "tr-print-02", location: "Salle B" },
  { ...base(), uuid: "ev-04", title: "Rendez-vous administratif", start: daysFromNow(6), end: daysFromNow(6), kind: "appointment", location: "Accueil" },
];

// ---- Documents ----
export const DOCUMENTS: StudentDocument[] = [
  { ...base(), uuid: "doc-01", name: "Facture — Design Graphique", kind: "invoice", training_uuid: "tr-graphic-01", size_kb: 128, url: "#" },
  { ...base(), uuid: "doc-02", name: "Reçu MTN #88291122", kind: "receipt", training_uuid: "tr-graphic-01", size_kb: 42, url: "#" },
  { ...base(), uuid: "doc-03", name: "Support de cours — Typographie", kind: "material", training_uuid: "tr-graphic-01", size_kb: 3120, url: "#" },
  { ...base(), uuid: "doc-04", name: "Certificat — Branding", kind: "certificate", training_uuid: "tr-branding-04", size_kb: 512, url: "#" },
  { ...base(), uuid: "doc-05", name: "Règlement intérieur", kind: "admin", size_kb: 220, url: "#" },
];

// ---- Support ----
export const TICKETS: SupportTicket[] = [
  {
    ...base(), uuid: "tk-01", subject: "Problème d'accès à la leçon",
    body: "Impossible d'ouvrir la leçon « Anatomie du caractère ».",
    status: "resolved",
    messages: [
      { uuid: uuid(), from: "student", body: "Bonjour, la vidéo ne se lance pas.", at: daysFromNow(-3) },
      { uuid: uuid(), from: "admin", body: "Bonjour Amina, le player est corrigé.", at: daysFromNow(-2) },
    ],
  },
  {
    ...base(), uuid: "tk-02", subject: "Modification de facturation",
    body: "Souhaite modifier l'adresse sur la facture.", status: "open",
    messages: [{ uuid: uuid(), from: "student", body: "Merci d'ajouter mon IFU.", at: daysFromNow(-1) }],
  },
];

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
