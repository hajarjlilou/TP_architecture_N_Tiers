// Fonction générique pour gérer les signaux
async function handleSignal(signal) {
  console.log(`Signal ${signal} reçu.`);
  console.log("Nettoyage en cours...");
  
  // Attendre 5 secondes avant de quitter le processus
  setTimeout(() => {
    console.log("Processus arrêté proprement.");
    process.exit(0); // Quitte le processus avec succès
  }, 5000);
}

// Écoute du signal SIGINT
process.on("SIGINT", () => handleSignal("SIGINT"));

// Simulation d'une application qui reste active
console.log("Application en cours d'exécution.");
console.log("Appuyez sur CTRL+C pour envoyer un signal.");

// Exécute une fonction toutes les 5 secondes
setInterval(() => {
  console.log("Le processus est toujours actif...");
}, 5000);
