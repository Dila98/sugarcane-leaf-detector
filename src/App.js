
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import "./App.css";

function App() {
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [annotatedImage, setAnnotatedImage] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    setPreview(URL.createObjectURL(file));
    setPrediction(null);
    setAnnotatedImage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // const res = await axios.post("https://final-sugarcane-leaf-disease-detector.onrender.com", formData, {
      const res = await axios.post("https://sugarcane-backend.onrender.com/predict" formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPrediction(res.data.disease);
      setAnnotatedImage(res.data.annotated_image_url);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: "image/*" });

  return (
    <div className="app">
      <div className="app-content">
      <h1>🌿 Sugarcane Leaf Disease Detector</h1>
      <div className="dropzone" {...getRootProps()}>
        <input {...getInputProps()} />
        <p>📂 Drag & drop a leaf image here, or click to select</p>
      </div>

      {prediction && (
        <div className="prediction-text">
          <h3>Prediction:</h3>
          <p>{prediction}</p>
        </div>
      )}

      {(preview || annotatedImage) && (
        <div className="images-container">
          {preview && (
            <div className="image-box">
              <h4>Uploaded Image</h4>
              <img src={preview} alt="Uploaded Leaf" />
            </div>
          )}
          {annotatedImage && (
            <div className="image-box">
              <h4>Annotated Image</h4>
              <img src={annotatedImage} alt="Annotated Leaf" />
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default App;

