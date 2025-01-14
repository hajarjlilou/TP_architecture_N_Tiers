const net = require("net");

const PORT = 6667;
const clients = [];

// Créer un serveur TCP
const server = net.createServer((socket) => {
  let userPseudo = null;
  let buffer = ""; // Tampon pour stocker les données entrantes

  // Adresse du client pour log
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`--- Nouvelle connexion : ${clientAddress}`);

  // Configurer le socket pour utiliser l'encodage UTF-8
  socket.setEncoding("utf-8");

  // Demander un pseudo au nouvel utilisateur
  socket.write("Bienvenue sur le chat IRC !\r\nVeuillez entrer votre pseudo : ");

  // Gestion des données reçues
  socket.on("data", (data) => {
    buffer += data; // Ajouter les données au tampon

    // Vérifier si l'utilisateur a appuyé sur Entrée
    if (buffer.includes("\n")) {
      const message = buffer.trim();
      buffer = ""; // Vider le tampon après avoir traité la chaîne complète

      // Si le pseudo n'est pas défini
      if (!userPseudo) {
        if (clients.some(client => client.pseudo === message)) {
          socket.write("Ce pseudo est déjà utilisé, choisissez-en un autre : \r\n");
        } else {
          userPseudo = message.replace(/[^a-zA-Z0-9]/g, ""); // Nettoyer les caractères spéciaux
          clients.push({ socket, pseudo: userPseudo });
          console.log(`--- ${userPseudo} a rejoint le chat.`);
          broadcast(`${userPseudo} a rejoint le chat.\r\n`, socket);
          socket.write(`Bienvenue ${userPseudo} ! Vous etes connecte au chat.\r\n`);
        }
      } else {
        // Envoyer le message aux autres utilisateurs
        broadcast(`[${userPseudo}] : ${message}\r\n`, socket);
      }
    }
  });

  // Gestion de la déconnexion
  socket.on("end", () => {
    console.log(`--- Déconnexion : ${userPseudo || clientAddress}`);
    if (userPseudo) {
      clients.splice(clients.findIndex(client => client.socket === socket), 1);
      broadcast(`${userPseudo} a quitté le chat.\r\n`, socket);
    }
  });

  // Gestion des erreurs
  socket.on("error", (err) => {
    console.error(`Erreur avec ${clientAddress} : ${err.message}`);
  });
});

// Diffuser un message à tous les clients sauf l'expéditeur
function broadcast(message, senderSocket) {
  clients.forEach(client => {
    if (client.socket !== senderSocket) {
      client.socket.write(message);
    }
  });
}

// Fonction pour fermer le serveur proprement
function shutdownServer(signal) {
  console.log(`Signal ${signal} reçu. Fermeture du serveur dans 5 secondes...`);

  // Notifier tous les clients connectés
  clients.forEach(client => {
    client.socket.write("Le serveur va fermer dans 5 secondes...\r\n");
  });

  // Attendre 5 secondes avant de fermer le serveur
  setTimeout(() => {
    console.log("Fermeture du serveur...");
    server.close(() => {
      console.log("Toutes les connexions sont fermées.");
      process.exit(0); // Quitte le processus proprement
    });

    // Forcer la fermeture si nécessaire
    setTimeout(() => {
      console.error("Forçage de la fermeture...");
      process.exit(1);
    }, 2000);
  }, 5000);
}

// Gestion des signaux SIGINT
process.on("SIGINT", () => shutdownServer("SIGINT"));

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`Serveur IRC en écoute sur le port ${PORT}`);
});
