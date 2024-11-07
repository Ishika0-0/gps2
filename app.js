// app.js

// Variables for tracking data
let startTime = null; // Time when the session started
let lastLatitude = null; // Previous latitude for distance calculation
let lastLongitude = null; // Previous longitude for distance calculation
let totalDistance = 0; // Total distance traveled in meters
let timerInterval = null; // Timer for tracking elapsed time
let watchId = null; // ID for geolocation watch to stop tracking

// Buttons
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");

// Update the time display every second
function updateTime() {
    const now = Date.now();
    const elapsed = (now - startTime) / 1000; // Elapsed time in seconds
    const minutes = Math.floor(elapsed / 60);
    const seconds = Math.floor(elapsed % 60);
    document.getElementById("time").textContent = `Time: ${pad(minutes)}:${pad(seconds)}`;
}

// Pad numbers less than 10 with a leading zero
function pad(num) {
    return num < 10 ? `0${num}` : num;
}

// Calculate the distance between two lat/lng points in meters using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of Earth in meters (not kilometers)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
}

// Start tracking function
function startTracking() {
    if ("geolocation" in navigator) {
        // Start the geolocation watch
        watchId = navigator.geolocation.watchPosition(function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const speed = position.coords.speed; // Speed in meters per second
            const speedInMs = speed ? speed.toFixed(2) : 0; // Speed in m/s (no conversion needed)

            // Display current speed in m/s
            document.getElementById("speed").textContent = `Speed: ${speedInMs} m/s`;

            // Display current coordinates
            document.getElementById("coordinates").textContent = `Latitude: ${lat.toFixed(4)}, Longitude: ${lon.toFixed(4)}`;

            // If this is the first location, set start time and initial coordinates
            if (!startTime) {
                startTime = Date.now();
                timerInterval = setInterval(updateTime, 1000); // Start the timer
            }

            // If we have previous coordinates, calculate distance in meters
            if (lastLatitude !== null && lastLongitude !== null) {
                const distance = calculateDistance(lastLatitude, lastLongitude, lat, lon);
                totalDistance += distance; // Add to the total distance (in meters)
                document.getElementById("distance").textContent = `Distance: ${totalDistance.toFixed(0)} m`;
            }

            // Update the previous coordinates for the next calculation
            lastLatitude = lat;
            lastLongitude = lon;

        }, function (error) {
            console.error("Error with geolocation: ", error);
            alert("Unable to access GPS. Please ensure location services are enabled.");
        }, {
            enableHighAccuracy: true,
            maximumAge: 10000, // Maximum cache age in ms
            timeout: 5000 // Timeout after 5 seconds
        });
        
        // Disable the "Start" button and enable "Stop" button
        startButton.disabled = true;
        stopButton.disabled = false;
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Stop tracking function
function stopTracking() {
    if (watchId !== null) {
        // Stop the geolocation watch
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    // Clear the timer
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Disable the "Stop" button and enable "Start" button
    startButton.disabled = false;
    stopButton.disabled = true;

    // Reset the tracking data
    lastLatitude = null;
    lastLongitude = null;
    totalDistance = 0;
    document.getElementById("speed").textContent = `Speed: 0 m/s`;
    document.getElementById("distance").textContent = `Distance: 0 m`;
    document.getElementById("time").textContent = `Time: 00:00`;
    document.getElementById("coordinates").textContent = `Latitude: 0, Longitude: 0`;
}

// Event listeners for Start and Stop buttons
startButton.addEventListener("click", startTracking);
stopButton.addEventListener("click", stopTracking);
