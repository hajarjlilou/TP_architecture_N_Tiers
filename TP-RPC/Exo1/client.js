const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "./games.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const gamesProto = grpc.loadPackageDefinition(packageDefinition).games;

const client = new gamesProto.GameService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

client.GetGamesList({}, (error, response) => {
  if (error) {
    console.error("Erreur:", error);
  } else {
    console.log("Liste des jeux :", response.games);
  }
});