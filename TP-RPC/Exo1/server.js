const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const axios = require("axios");

const PROTO_PATH = "./games.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const gamesProto = grpc.loadPackageDefinition(packageDefinition).games;

const API_URL = "https://www.freetogame.com/api/games";

// Implémentation du service gRPC
async function GetGamesList(call, callback) {
  try {
    const response = await axios.get(API_URL);
    const games = response.data.map(game => ({
      id: game.id.toString(),
      title: game.title,
      genre: game.genre,
      platform: game.platform,
      thumbnail: game.thumbnail,
    }));

    callback(null, { games });
  } catch (error) {
    console.error("Erreur lors de l'appel API :", error);
    callback({
      code: grpc.status.INTERNAL,
      message: "Erreur lors de la récupération des jeux",
    });
  }
}

// Création du serveur gRPC
function startServer() {
  const server = new grpc.Server();
  server.addService(gamesProto.GameService.service, { GetGamesList });

  const address = "0.0.0.0:50051";
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Serveur gRPC démarré sur ${address}`);
    server.start();
  });
}

startServer();