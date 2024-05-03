// Import required modules
const grpc = require('@grpc/grpc-js');
const protoloader = require('@grpc/proto-loader');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// Load protocol buffers for traffic lights service
const dealershipPackageDefinition = protoloader.loadSync('protos/product_service.proto', {});
const dealershipProto = grpc.loadPackageDefinition(dealershipPackageDefinition).StockManagement;

// Function to display the main menu options
function showMainMenu() {
    console.log("Dealership Product Management:");
    console.log("1) Get car");
    console.log("2) Update car");
    console.log("3) Add car");
    console.log("4) List cars");
    console.log("Press anything else to exit.")
}

// Function to handle GetCarDetails unary RPC
async function handleGetCar() {
    try {
        const client = new dealershipProto.DealershipService('localhost:50051', grpc.credentials.createInsecure());

        // Get car ID from user input
        const carId = await new Promise((resolve) => readline.question('Enter Car ID: ', resolve));

        // Prepare request body with car ID
        const request = {
            carId: carId
        };

        console.log("CAR ID IN CLIENT:", request);

        // Call GetCarDetails RPC method and handle response
        client.GetCarDetails(request, function (err, response) {
            if (err) {
                console.error(err);
            } else {
                console.log('Car Details:', response.car);
            }
        });
    } catch (error) {
        console.error('Error fetching car details:', error.message);
    }
}

// Function to handle ListAllCars server streaming RPC
function handleListCars() {
    try {
        const client = new dealershipProto.DealershipService('localhost:50051', grpc.credentials.createInsecure());

        // Initialize the call for server-side streaming
        const call = client.ListAllCars({});

        // Set up event listener for receiving stream of cars
        call.on('data', function (car) {
            // Process each car received from the server
            console.log('Car:', car);
        });

        call.on('end', function () {
            // Handle the end of the streaming
            console.log('Streaming ended');
        });
    } catch (error) {
        console.error('Error streaming cars:', error.message);
    }
}

// Function to handle AddCar client streaming RPC
async function handleAddCar() {
    try {
        const client = new dealershipProto.DealershipService('localhost:50051', grpc.credentials.createInsecure());

        // Initialize the call for client-side streaming
        const call = client.AddCar(function (err, response) {
            if (err) {
                console.error(err);
            } else {
                console.log('Add Car Response:', response);
            }
        });

        // Prompt user for input and send requests
        while (true) {
            const carName = await new Promise((resolve) => readline.question('Enter Car Name (press Enter to exit): ', resolve));
            if (!carName) {
                // If the user enters an empty string, end the streaming
                call.end();
                break;
            }

            const carPrice = await new Promise((resolve) => readline.question('Enter Price (press Enter to exit): ', resolve));
            if (!carPrice) {
                // If the user enters an empty string, end the streaming
                call.end();
                break;
            }

            const carQuantity = await new Promise((resolve) => readline.question('Enter Quantity (press Enter to exit): ', resolve));
            if (!carQuantity) {
                // If the user enters an empty string, end the streaming
                call.end();
                break;
            }

            // Prepare request body with car details
            const request = {
                car: {
                    name: carName,
                    price: parseFloat(carPrice),
                    quantity: parseInt(carQuantity)
                }
            };

            // Send request to the server
            call.write(request);
        }
    } catch (error) {
        console.error('Error adding car:', error.message);
    }
}

// Function to handle UpdateCarInventory bidirectional streaming RPC
async function handleUpdateCar() {
    try {
        const client = new dealershipProto.DealershipService('localhost:50051', grpc.credentials.createInsecure());

        // Initialize the call for bidirectional streaming
        const call = client.updateCarInventory();

        // Set up event listener for receiving responses
        call.on('data', function (response) {
            // Process each response received from the server
            console.log('Update Car Response:', response);
        });

        call.on('end', function () {
            // Handle the end of the streaming
            console.log('Streaming ended');
        });

        // Prompt user for input and send requests
        while (true) {
            const carId = await new Promise((resolve) => readline.question('Enter Car ID (press Enter to exit): ', resolve));
            if (!carId) {
                // If the user enters an empty string, end the streaming
                call.end();
                break;
            }

            const quantityDelta = await new Promise((resolve) => readline.question('Enter Quantity Delta: ', resolve));

            // Prepare request body with car ID and quantity delta
            const request = {
                carId: carId,
                quantityDelta: parseInt(quantityDelta)
            };

            // Send request to the server
            call.write(request);
        }
    } catch (error) {
        console.error('Error updating car inventory:', error.message);
    }
}

// Main function to display the main menu and handle user choices
async function main() {
    try {
        showMainMenu();

        readline.question('Enter your choice: ', async function (choice) {
            switch (choice) {
                case '1':
                    await handleGetCar(); // Handle Get Car
                    break;
                case '2':
                    await handleUpdateCar(); // Handle Update Car
                    break;
                case '3':
                    await handleAddCar(); // Handle Add Car
                    break;
                case '4':
                    handleListCars(); // Handle List Cars
                    break;
                default:
                    console.log("Invalid choice");
            }

            // Ask for the next choice recursively
            await main();
        });

    } catch (error) {
        console.error("Error handling main menu:", error.message);
    }

}

// Execute the main function
main();
