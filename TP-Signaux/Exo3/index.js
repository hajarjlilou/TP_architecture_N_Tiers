let canExit = true; // Variable pour déterminer si le signal peut être traité

// Fonction pour gérer les signaux
async function handleSignal(signal) {
  if (canExit) {
    console.log(`Signal ${signal} reçu.`);
    console.log("Nettoyage en cours...");
    
    // Attente de 5 secondes avant de quitter proprement
    setTimeout(() => {
      console.log("Processus arrêté proprement.");
      process.exit(0);
    }, 5000);
  } else {
    console.log("L'arrêt est impossible pour le moment. Phase critique en cours.");
  }
}

// Écoute du signal SIGINT
process.on("SIGINT", () => handleSignal("SIGINT"));

// Simulation d'une application qui reste active
console.log("Application en cours d'exécution.");
console.log("Appuyez sur CTRL+C pour envoyer un signal.");

// Intervalle pour alterner entre les états "arrêt possible" et "arrêt impossible"
setInterval(() => {
  canExit = !canExit; // Alterne l'état
  if (canExit) {
    console.log("L'application est dans une phase où elle peut être arrêtée.");
  } else {
    console.log("L'application est dans une phase critique : arrêt impossible.");
  }
}, 5000);

// Message d'état pour maintenir l'utilisateur informé
setInterval(() => {
  console.log("Le processus est toujours actif...");
}, 5000);
