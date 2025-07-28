import React, { useState, useEffect } from "react";

export default function ImageUploader({ locationName }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);

  const API_BASE = "https://0xi0ck7hti.execute-api.us-east-1.amazonaws.com";

  useEffect(() => {
    if (!locationName) return;
    const fetchImages = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/getImagesForLocation?locationName=${encodeURIComponent(locationName)}`
        );
        const data = await response.json();
        setImages(data);
      } catch (err) {
        console.error("Error fetching images:", err);
      }
    };
    fetchImages();
  }, [locationName]);

  const onFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError("");
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }
    if (!locationName) {
      setError("Please set destination first.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const fileType = selectedFile.type;

      const resp1 = await fetch(`${API_BASE}/generateSignedUrl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileType, locationName }),
      });
      if (!resp1.ok) throw new Error("Could not get signed URL");

      const { uploadUrl, imageUrl } = await resp1.json();

      const resp2 = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": fileType },
        body: selectedFile,
      });
      if (!resp2.ok) throw new Error("Upload failed");

      const resp3 = await fetch(`${API_BASE}/saveImageMetadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationName, imageUrl }),
      });
      if (!resp3.ok) throw new Error("Saving metadata failed");

      setImages(prev => [...prev, { imageUrl }]);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h5>Trip Images</h5>
      <input type="file" accept="image/*" onChange={onFileChange} />
      <button onClick={uploadFile} disabled={uploading || !locationName}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {images.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", marginTop: "10px" }}>
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img.imageUrl}
              alt={`Trip ${locationName}`}
              style={{ maxWidth: "120px", margin: "5px", borderRadius: "4px" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
