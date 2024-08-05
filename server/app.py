from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from collections import deque

app = Flask(__name__)
CORS(app)

# Load your LSTM model
model = load_model('action.h5')
frame_sequence = deque(maxlen=30)
sentence = []
predictions = []
threshold = 0.5
actions = ['hello', 'thanks', 'awesome', 'ready', 'i', 'i love you']  # Update this based on your model's classes

@app.route('/predict', methods=['POST'])
def predict():
    global sentence, predictions  # Declare these as global variables

    data = request.get_json()
    frame_data = data['frame'].split(',')[1]  # Remove data URL prefix
    frame_bytes = base64.b64decode(frame_data)  # Decode base64 to bytes
    frame_np = np.frombuffer(frame_bytes, dtype=np.uint8)  # Convert bytes to numpy array
    frame = cv2.imdecode(frame_np, cv2.IMREAD_GRAYSCALE)  # Decode image to grayscale
    
    # Resize frame to match expected input shape of (1662,)
    resized_frame = cv2.resize(frame, (1662, 1))
    
    # Normalize the pixel values
    resized_frame = resized_frame.astype(np.float32) / 255.0
    
    # Reshape to (1, 1662)
    input_data = resized_frame.reshape(1, 1662)
    
    # Append the frame to the sequence
    frame_sequence.append(input_data)
    
    if len(frame_sequence) == 30:
        # Convert the deque to a numpy array
        sequence_array = np.array(frame_sequence)
        
        # Reshape to (1, 30, 1662)
        sequence_array = sequence_array.reshape(1, 30, 1662)
        
        # Make prediction
        res = model.predict(sequence_array)[0]
        predictions.append(np.argmax(res))
        
        # Viz logic (similar to the original code)
        if np.unique(predictions[-10:])[0] == np.argmax(res):
            if res[np.argmax(res)] > threshold:
                if len(sentence) > 0:
                    if actions[np.argmax(res)] != sentence[-1]:
                        sentence.append(actions[np.argmax(res)])
                else:
                    sentence.append(actions[np.argmax(res)])
        
        if len(sentence) > 5:
            sentence = sentence[-5:]
        
        return jsonify({
            'prediction': res.tolist(),
            'sentence': ' '.join(sentence),
            'sequence_complete': True
        })
    else:
        return jsonify({
            'sequence_complete': False
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)