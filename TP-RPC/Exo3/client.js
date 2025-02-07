const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './products.proto';

// Charger le fichier .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const productsProto = grpc.loadPackageDefinition(packageDefinition).products;

// Créer un client gRPC
const client = new productsProto.ProductService('localhost:50051', grpc.credentials.createInsecure());

client.AddProduct({ name: 'laptop alexandre', description: 'gaming laptop', price: 1500.0 }, (err, response) => {
  if (err) console.error(err);
  else console.log(response.message);

  client.GetProducts({}, (err, response) => {
    if (err) console.error(err);
    else console.log('Produits:', response.products);

    const productId = response.products[0].id;
    client.UpdateProduct({ id: productId, name: 'Laptop Pro', price: 1700.0 }, (err, response) => {
      if (err) console.error(err);
      else console.log(response.message);

      client.DeleteProduct({ id: productId }, (err, response) => {
        if (err) console.error(err);
        else console.log(response.message);
      });
    });
  });
});

