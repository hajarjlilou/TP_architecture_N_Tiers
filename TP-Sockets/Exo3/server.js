const net = require("net");

const PORT = 6667;
const clients = [];

// Créer un serveur TCP
const server = net.createServer((socket) => {
  let userPseudo = null;
  let buffer = ""; // Tampon pour stocker les données entrantes

  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`--- Nouvelle connexion : ${clientAddress}`);

  socket.setEncoding("utf-8");

  // Demander un pseudo au nouvel utilisateur
  socket.write("Bienvenue sur le chat IRC !\r\nVeuillez entrer votre pseudo : ");

  socket.on("data", (data) => {
    buffer += data;

    // Vérifier si l'utilisateur a appuyé sur Entrée
    if (buffer.includes("\n")) {
      const message = buffer.trim(); // Supprimer les espaces et caractères superflus
      buffer = ""; // Réinitialiser le tampon

      if (!userPseudo) {
        if (clients.some(client => client.pseudo === message)) {
          socket.write("Ce pseudo est deja utilise, choisissez-en un autre : \r\n");
        } else {
          userPseudo = message.replace(/[^a-zA-Z0-9]/g, ""); // Nettoyer le pseudo
          clients.push({ socket, pseudo: userPseudo });
          console.log(`--- ${userPseudo} a rejoint le chat.`);
          broadcast(`${userPseudo} a rejoint le chat.\r\n`, socket);
          socket.write(`Bienvenue ${userPseudo} ! Vous etes connecte au chat.\r\n`);
        }
      } else {
        if (message.startsWith("/")) {
          handleCommand(message, socket);
        } else {
          broadcast(`[${userPseudo}] : ${message}\r\n`, socket);
        }
      }
    }
  });

  socket.on("end", () => {
    console.log(`--- Déconnexion : ${userPseudo || clientAddress}`);
    if (userPseudo) {
      clients.splice(clients.findIndex(client => client.socket === socket), 1);
      broadcast(`${userPseudo} a quitte le chat.\r\n`, socket);
    }
  });

  socket.on("error", (err) => {
    console.error(`Erreur avec ${clientAddress} : ${err.message}`);
  });
});

function handleCommand(command, socket) {
  const cleanCommand = command.trim(); // Nettoyer les espaces et caractères de contrôle
  const [cmd, ...args] = cleanCommand.split(" ");

  if (cmd === "/list") {
    const userList = clients.map(client => client.pseudo).join(", ");
    socket.write(`Utilisateurs connectes : ${userList || "Aucun"}\r\n`);
  } else {
    console.log(cmd);
    socket.write("Commande inconnue.\r\n");
  }
}

function broadcast(message, senderSocket) {
  clients.forEach(client => {
    if (client.socket !== senderSocket) {
      client.socket.write(message);
    }
  });
}

server.listen(PORT, () => {
  console.log(`Serveur IRC en ecoute sur le port ${PORT}`);
});