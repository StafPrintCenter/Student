export function getGreeting(name: string, date: Date = new Date()): string {
  const hour = date.getHours();
  let greetings: string[];

  if (hour >= 5 && hour < 12) {
    greetings = [
      "Bonjour {name} !",
      "Belle matinée {name} !",
      "Très belle matinée {name} !",
      "Excellente matinée {name} !",
    ];
  } else if (hour >= 12 && hour < 14) {
    greetings = [
      "Bonjour {name} !",
      "Bon appétit {name} !",
      "Bon midi {name} !",
      "Belle pause déjeuner {name} !",
    ];
  } else if (hour >= 14 && hour < 18) {
    greetings = [
      "Bon après-midi {name} !",
      "Bel après-midi {name} !",
      "Très bon après-midi {name} !",
      "Ravi de vous revoir, {name} !",
    ];
  } else if (hour >= 18 && hour < 23) {
    greetings = [
      "Bonsoir {name} !",
      "Belle soirée {name} !",
      "Excellente soirée {name} !",
      "Très belle soirée {name} !",
    ];
  } else {
    greetings = [
      "Bonsoir {name} !",
      "Bonne nuit {name} !",
      "Douce nuit {name} !",
      "Belle nuit {name} !",
    ];
  }

  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  return greeting.replace("{name}", name);
}

export function getWelcomeMessage(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Bienvenue dans votre atelier d'apprentissage.";
  }
  if (hour >= 12 && hour < 18) {
    return "Bon retour dans votre espace d'apprentissage. Reprenons là où vous en étiez.";
  }
  if (hour >= 18 && hour < 22) {
    return "Votre atelier d'apprentissage vous attend. Avancez à votre rythme.";
  }
  return "Il est tard : prenez une pause, votre espace d'apprentissage vous attendra demain.";
}
