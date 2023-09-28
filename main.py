from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import tensorflow as tf

app = Flask(__name__)
# Load your saved model
#{{ url_for('static', filename='css/index.css') }}
model = tf.keras.models.load_model("C:\\Users\\aarus\\model_i_made.h5")


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        alpha_pixel_data = request.json.get('pixelData')  # Receive alpha pixel data as an array

        if alpha_pixel_data:
          # Reshape the alpha pixel data into a 400x400x4 array
          canvas_size = (400, 400, 4)
          canvas = np.array(alpha_pixel_data, dtype=np.uint8).reshape(canvas_size)
          gray_canvas = cv2.cvtColor(canvas, cv2.COLOR_RGBA2GRAY)
          resized_canvas = cv2.resize(gray_canvas, (400, 400))
          coords = cv2.findNonZero(resized_canvas)
          if coords is None:
             print("nothing to predict") # Skip prediction if no content is drawn
          x, y, w, h = cv2.boundingRect(coords)
           # Extract the region of interest (ROI) containing the drawn content
          roi = resized_canvas[y:y+h, x:x+w]
        
          # Resize the ROI to 20x20
          resized_roi = cv2.resize(roi, (19, 19))
           # Create a 28x28 canvas and place the resized ROI in the center with padding
          centered_image = np.zeros((28, 28), dtype=np.uint8)
          x_offset = (28 - resized_roi.shape[1]) // 2
          y_offset = (28 - resized_roi.shape[0]) // 2
          centered_image[y_offset:y_offset+resized_roi.shape[0], x_offset:x_offset+resized_roi.shape[1]] = resized_roi
        
          # Normalize the centered image
          normalized_image = centered_image / 255.0
        
          # Make predictions using your model
          predictions = model.predict(centered_image.reshape(1, 28, 28, 1))
        
          # Convert prediction to alphabet
          alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
          predicted_alphabet = alphabets[np.argmax(predictions)]
          print("Predicted Alphabet:", predicted_alphabet)


    # Save the alpha channel image as an image (optional)
          cv2.imwrite('received_image.png', centered_image)

    # Return a response (e.g., confirmation message)
          return jsonify({'predicted_letter': predicted_alphabet})
           
     
           

        else:
            return jsonify({'error': 'No pixel data received'})

    except Exception as e:
        # Log any exceptions or errors that occur during processing
        print(f'Error processing data: {str(e)}')
        return jsonify({'error': 'An error occurred'})

if __name__ == '__main__':
      app.run()