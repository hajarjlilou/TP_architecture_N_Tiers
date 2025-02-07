const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { MongoClient, ObjectId } = require('mongodb');

const PROTO_PATH = './products.proto';
const MONGO_URL = 'mongodb://localhost:27017';
const DATABASE_NAME = 'productdb';
const COLLECTION_NAME = 'products';

let db, productsCollection;

// Connexion à MongoDB
MongoClient.connect(MONGO_URL, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db(DATABASE_NAME);
    productsCollection = db.collection(COLLECTION_NAME);
    console.log('Connexion à MongoDB réussie');
  })
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err);
  });

// Charger le fichier .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const productsProto = grpc.loadPackageDefinition(packageDefinition).products;

// Implémentation des méthodes gRPC
const addProduct = (call, callback) => {
  const product = call.request;
  productsCollection.insertOne(product)
    .then(() => {
      console.log('Produit ajouté avec succès!');
      return productsCollection.find().toArray();
    })
    .then((products) => {
      console.log('État actuel de la base après ajout :', products);
      callback(null, { message: 'Produit ajouté avec succès!' });
    })
    .catch((err) => callback(err));
};

const updateProduct = (call, callback) => {
  const product = call.request;
  const { id, ...updateFields } = product;
  productsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateFields })
    .then(() => {
      console.log('Produit mis à jour avec succès!');
      return productsCollection.find().toArray();
    })
    .then((products) => {
      console.log('État actuel de la base après mise à jour :', products);
      callback(null, { message: 'Produit mis à jour avec succès!' });
    })
    .catch((err) => callback(err));
};

const deleteProduct = (call, callback) => {
  const { id } = call.request;
  productsCollection.deleteOne({ _id: new ObjectId(id) })
    .then(() => {
      console.log('Produit supprimé avec succès!');
      return productsCollection.find().toArray();
    })
    .then((products) => {
      console.log('État actuel de la base après suppression :', products);
      callback(null, { message: 'Produit supprimé avec succès!' });
    })
    .catch((err) => callback(err));
};

const getProducts = (call, callback) => {
  productsCollection.find().toArray()
    .then((products) => {
      const productList = products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        price: p.price,
      }));
      callback(null, { products: productList });
    })
    .catch((err) => callback(err));
};

const server = new grpc.Server();
server.addService(productsProto.ProductService.service, {
  AddProduct: addProduct,
  UpdateProduct: updateProduct,
  DeleteProduct: deleteProduct,
  GetProducts: getProducts,
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Serveur gRPC en cours d\'exécution sur http://0.0.0.0:50051');
  server.start();
});
