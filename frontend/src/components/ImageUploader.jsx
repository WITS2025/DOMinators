import React, { useState, useEffect } from "react";

export default function ImageUploader({ locationName }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);

  const API_BASE = "https://04vzht9lw9.execute-api.us-east-1.amazonaws.com/";

  // Load existing images when component mounts
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/getImagesForLocation?locationName=${encodeURIComponent(locationName)}`
        );
        const data = await response.json();
        setImages(data);
      } catch (err) {
        console.error("Failed to load images:", err);
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

    setUploading(true);
    setError("");

    try {
      const fileType = selectedFile.type;

      // 1. Get signed URL
      const response = await fetch(`${API_BASE}/generateSignedUrl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileType }),
      });

      if (!response.ok) throw new Error("Failed to get signed URL");

      const { uploadUrl, imageUrl } = await response.json();

      // 2. Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": fileType },
        body: selectedFile,
      });

      if (!uploadResponse.ok) throw new Error("Upload to S3 failed");

      // 3. Save metadata to DynamoDB
      const saveResponse = await fetch(`${API_BASE}/saveImageMetadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationName,
          imageUrl,
        }),
      });

      if (!saveResponse.ok) throw new Error("Failed to save image metadata");

      // 4. Update local image list
      setImages((prev) => [...prev, { imageUrl }]);
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
      <h3>Upload an Image for {locationName}</h3>

      <input type="file" accept="image/*" onChange={onFileChange} />
      <button onClick={uploadFile} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {images.length > 0 && (
        <div>
          <h4>Uploaded Images:</h4>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img.imageUrl}
                alt={`Location ${locationName}`}
                style={{ maxWidth: "200px", margin: "10px" }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}




