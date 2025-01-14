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

    if (buffer.includes("\n")) {
      const message = buffer.trim();
      buffer = "";

      if (!userPseudo) {
        if (clients.some(client => client.pseudo === message)) {
          socket.write("Ce pseudo est deja utilise, choisissez-en un autre : \r\n");
        } else {
          userPseudo = message.replace(/[^a-zA-Z0-9]/g, "");
          clients.push({ socket, pseudo: userPseudo });
          console.log(`--- ${userPseudo} a rejoint le chat.`);
          broadcast(`${userPseudo} a rejoint le chat.\r\n`, socket);
          socket.write(`Bienvenue ${userPseudo} ! Vous etes connecte au chat.\r\n`);
        }
      } else {
        if (message.startsWith("/")) {
          handleCommand(message, socket, userPseudo);
        } else {
          broadcast(`[${userPseudo}] : ${message}\r\n`, socket);
        }
      }
    }
  });

  socket.on("end", () => {
    console.log(`--- Deconnexion : ${userPseudo || clientAddress}`);
    if (userPseudo) {
      clients.splice(clients.findIndex(client => client.socket === socket), 1);
      broadcast(`${userPseudo} a quitte le chat.\r\n`, socket);
    }
  });

  socket.on("error", (err) => {
    console.error(`Erreur avec ${clientAddress} : ${err.message}`);
  });
});

// Fonction pour gérer les commandes
function handleCommand(command, socket, userPseudo) {
  const cleanCommand = command.trim();
  const [cmd, ...args] = cleanCommand.split(" ");

  if (cmd === "/list") {
    const userList = clients.map(client => client.pseudo).join(", ");
    socket.write(`Utilisateurs connectes : ${userList || "Aucun"}\r\n`);
  } else if (cmd === "/whisper") {
    handleWhisper(args, socket, userPseudo);
  } else {
    socket.write("Commande inconnue.\r\n");
  }
}

// Fonction pour gérer les chuchotements
function handleWhisper(args, senderSocket, senderPseudo) {
  // Si la commande est mal formée
  if (args.length < 2) {
    senderSocket.write("Utilisation : /whisper <pseudo> \"<message>\"\r\n");
    return;
  }

  const recipientPseudo = args[0];
  // Joindre les arguments restants pour former le message (qui peut avoir des espaces)
  const message = args.slice(1).join(" ").trim();

  if (!message.startsWith("\"") || !message.endsWith("\"")) {
    senderSocket.write("Le message doit etre entre guillemets : /whisper <pseudo> \"<message>\"\r\n");
    return;
  }

  // Nettoyer le message en enlevant les guillemets
  const cleanMessage = message.slice(1, -1);

  // Chercher l'utilisateur destinataire
  const recipient = clients.find(client => client.pseudo === recipientPseudo);

  if (!recipient) {
    senderSocket.write(`Utilisateur "${recipientPseudo}" non trouve.\r\n`);
    return;
  }

  // Envoyer le message formaté au destinataire
  recipient.socket.write(`[Whisper][${senderPseudo}] ${cleanMessage}\r\n`);

  // Envoyer une confirmation à l'expéditeur
  senderSocket.write(`Message envoye a ${recipientPseudo} : ${cleanMessage}\r\n`);
}

// Diffuser un message à tous les clients sauf l'expéditeur
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
