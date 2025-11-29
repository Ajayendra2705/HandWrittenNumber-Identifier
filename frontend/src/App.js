import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImage = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult("");
  };

  const onFileDrop = (e) => {
    e.preventDefault();
    handleImage(e.dataTransfer.files[0]);
  };

  const browseFile = (e) => {
    handleImage(e.target.files[0]);
  };

  const toBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  const detectNumber = async () => {
    if (!image) return;

    setLoading(true);
    setResult("");

    const base64 = await toBase64(image);

    const res = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64 }),
    });

    const data = await res.json();
    setResult(data.number);
    setLoading(false);
  };

  return (
    <div className="page">
      <h1 className="title">AI Handwritten Number Detector</h1>
      <p className="subtitle">Upload a handwritten number and let AI identify it for you.</p>

      <div
        className="upload-box"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onFileDrop}
      >
        <input type="file" id="fileInput" accept="image/*" onChange={browseFile} hidden />
        <label htmlFor="fileInput" className="upload-label">
          <div className="upload-icon">📄</div>
          <p>Click or Drag & Drop Image Here</p>
        </label>
      </div>

      {preview && (
        <div className="preview-card glass-card">
          <img src={preview} alt="preview" className="preview-img" />
        </div>
      )}

      {preview && (
        <button className="detect-btn" onClick={detectNumber} disabled={loading}>
          {loading ? "Analyzing..." : "Detect Number"}
        </button>
      )}

      {loading && <div className="loader"></div>}

      {result && (
        <div className="result-box glass-card">
          <h2>Detected Number</h2>
          <div className="result-value">{result}</div>
        </div>
      )}
    </div>
  );
}
