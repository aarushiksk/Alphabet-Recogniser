const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.width = 400;
canvas.height = 400;

canvas.addEventListener('mousedown', () => {
    drawing = true;
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.beginPath();
});
function startPosition(e) {
    drawing = true;
    draw(e);
}

function endPosition() {
    drawing = false;
    ctx.beginPath();
}

function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}


canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchstart', (e) => {
    startPosition(e.touches[0]);
});
canvas.addEventListener('touchend', endPosition);
canvas.addEventListener('touchmove', (e) => {
    draw(e.touches[0]);
    e.preventDefault();
});


function clearCanvas() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const predictedAlphabetElement = document.getElementById('predictedAlphabet');
    predictedAlphabetElement.textContent = 'PREDICTED ALPHABET:';
}


function predict() {
    // Convert the fullCanvas to grayscale and get the pixel data
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Create a new canvas with the same dimensions
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = canvas.width;
    fullCanvas.height = canvas.height;

    const fullContext = fullCanvas.getContext('2d');

    // Step 1: Fill the fullCanvas with a black background (grayscale)
    fullContext.fillStyle = 'black';  // Set the fill color to black
    fullContext.fillRect(0, 0, fullCanvas.width, fullCanvas.height);  // Fill the entire canvas with black

    // Step 2: Convert the original canvas to grayscale
    fullContext.drawImage(canvas, 0, 0);  // Copy the content from the original canvas
    const imageData = fullContext.getImageData(0, 0, fullCanvas.width, fullCanvas.height);

    // Get the grayscale pixel data
    const pixelData = Array.from(imageData.data);

    // Send pixel data to the server using a fetch request
    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pixelData }), // Send grayscale pixel data
    })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server
            if (data && data.predicted_letter) {
                const predictedAlphabetElement = document.getElementById('predictedAlphabet');
                predictedAlphabetElement.textContent = `PREDICTED ALPHABET:${data.predicted_letter}`;
            }

            else {
                // Handle the case where no prediction was received
                const predictedAlphabetElement = document.getElementById('predictedAlphabet');
                predictedAlphabetElement.textContent = 'No prediction available.';
            }

        });
}
function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect(); // Get the canvas's position on the page
    const x = e.clientX - rect.left; // Adjust the x-coordinate
    const y = e.clientY - rect.top; // Adjust the y-coordinate
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'white';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}