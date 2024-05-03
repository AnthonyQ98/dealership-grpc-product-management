// Import required modules
const grpc = require('@grpc/grpc-js');
const protoloader = require('@grpc/proto-loader');

// Import service implementations
const { updateCarInventory, addCar, listAllCars, getCarDetails } = require('../services/product_management');

// Load protocol buffer for dealership service
const dealershipPackageDefinition = protoloader.loadSync('protos/product_service.proto', {});
const dealershipProto = grpc.loadPackageDefinition(dealershipPackageDefinition).stock_management;

// Create gRPC server
const server = new grpc.Server();

// Define server address
const serverAddr = '0.0.0.0:50051';

// Create an object containing service implementation
const services = {
    Update: updateCarInventory,
    Add: addCar,
    List: listAllCars, 
    Get: getCarDetails,
};

// Add service to the gRPC server
server.addService(dealershipProto.DealershipService.service, services);


// Bind the server to the specified address and start it
server.bindAsync(serverAddr, grpc.ServerCredentials.createInsecure(), () => {
    console.log("Product management server running at " + serverAddr);
});
