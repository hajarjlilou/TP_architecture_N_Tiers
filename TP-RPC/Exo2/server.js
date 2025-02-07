const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const axios = require('axios');
const PROTO_PATH = './games.proto';

// Charger le fichier .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const gamesProto = grpc.loadPackageDefinition(packageDefinition).games;

// Fonction pour récupérer les jeux via l'API FreeToGame
const getGamesFromAPI = async () => {
  try {
    // Requête vers l'API FreeToGame pour obtenir une liste de jeux
    const response = await axios.get('https://www.freetogame.com/api/games');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API FreeToGame:", error);
    throw error;
  }
};

// Implémentation de la méthode GetGames
const getGames = async (call, callback) => {
  try {
    const gamesData = await getGamesFromAPI();
    const gamesList = gamesData.map(game => ({
      id: game.id,
      title: game.title,
      genre: game.genre,
      platform: game.platform,
    }));
    callback(null, { games: gamesList });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: "Erreur lors de la récupération des jeux",
    });
  }
};

// Démarrer le serveur gRPC
const server = new grpc.Server();
server.addService(gamesProto.GameService.service, { GetGames: getGames });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Serveur gRPC en écoute sur http://0.0.0.0:50051');
  server.start();
});
