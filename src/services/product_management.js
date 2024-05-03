// Define an array to hold cars
const cars = [
    { id: '1', name: 'Toyota Camry', price: 25000, quantity: 5 },
    { id: '2', name: 'Honda Civic', price: 22000, quantity: 8 },
    { id: '3', name: 'Ford Mustang', price: 35000, quantity: 3 }
];

// Function to get car details
function getCarDetails(call, callback) {
    const request = call.request;
    console.log("Call is:", call);
    console.log("request is: ", request);
    const carId = request.carId;

    console.log("Car id is:", carId);

    console.log("Cars array is: ", cars);

    // Find the car in the array by its ID
    const car = cars.find(car => car.id == carId);

    if (!car) {
        // If the car with the specified ID is not found, return an error
        callback(new Error("Car not found"), null);
    } else {
        // Send the car details back to the client
        callback(null, { car: car });
    }
}

// Function to handle ListAllCars server streaming RPC
function listAllCars(call) {
    try {
        // Stream each car to the client
        cars.forEach(car => call.write(car));
        call.end();
    } catch (error) {
        // Handle any errors that occur during streaming
        console.error('Error streaming cars:', error.message);
        call.emit('error', error);
    } finally {
        // Signal the end of streaming
        call.end();
    }
}

// Function to handle AddCar client streaming RPC
function addCar(call, callback) {
    try {
        // Listen for incoming car details from the client
        call.on('data', function (request) {
            // Process each incoming car (placeholder logic: log car details)
            console.log('Received car:', request.car);
            cars.push(request.car);
        });

        // Signal the end of data transmission
        call.on('end', function () {
            // Prepare response indicating success
            const response = {
                success: true
            };
            // Send response back to the client
            callback(null, response);
        });
    } catch (error) {
        // Handle any errors that occur during processing
        console.error('Error adding car:', error.message);
        callback(error);
    }
}

// Function to update car inventory bidirectionally
function updateCarInventory(call) {
    // Handle incoming requests from the client
    call.on('data', function (request) {
        const carId = request.carId;
        const quantityDelta = request.quantityDelta;

        // Find the car in the array by its ID
        const carToUpdate = cars.find(car => car.id === carId);

        if (!carToUpdate) {
            // If the car with the specified ID is not found, send an error response
            call.write({ success: false, message: `Car with ID ${carId} not found` });
        } else {
            // Update the quantity of the car
            carToUpdate.quantity += quantityDelta;

            console.log(`Updated inventory of car ${carId}. New quantity: ${carToUpdate.quantity}`);

            // Send a success response back to the client
            call.write({ success: true });
        }
    });

    // Handle end of client stream
    call.on('end', function () {
        // Close the call
        call.end();
    });
}


// Export the changeSignalTimings function to make it accessible from other modules
module.exports = { updateCarInventory, addCar, listAllCars, getCarDetails };
