const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './games.proto';

// Charger le fichier .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const gamesProto = grpc.loadPackageDefinition(packageDefinition).games;

// Créer un client gRPC
const client = new gamesProto.GameService('localhost:50051', grpc.credentials.createInsecure());

// Appeler GetGames
client.GetGames({}, (error, response) => {
  if (error) {
    console.error("Erreur:", error);
  } else {
    console.log("Liste des jeux disponibles:");
    response.games.forEach(game => {
      console.log(`ID: ${game.id}, Titre: ${game.title}, Genre: ${game.genre}, Plateforme: ${game.platform}`);
    });
  }
});
