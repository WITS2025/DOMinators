import React, { useState } from "react";

export default function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const onFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError("");
  };

  const onLocationChange = (e) => {
    setLocationName(e.target.value);
    setError("");
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }
    if (!locationName.trim()) {
      setError("Please enter a location name.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const fileType = selectedFile.type;

      const response = await fetch(
        "https://0xi0ck7hti.execute-api.us-east-1.amazonaws.com/generateSignedUrl",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileType, locationName: locationName.trim() }),
        }
      );

      if (!response.ok) throw new Error("Failed to get signed URL");

      const { uploadUrl, imageUrl } = await response.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": fileType },
        body: selectedFile,
      });

      if (!uploadResponse.ok) throw new Error("Upload to S3 failed");

      setImageUrl(imageUrl);
      setSelectedFile(null);
      setLocationName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter location name"
        value={locationName}
        onChange={onLocationChange}
      />
      <br />
      <input type="file" accept="image/*" onChange={onFileChange} />
      <br />
      <button onClick={uploadFile} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {imageUrl && (
        <div>
          <p>Uploaded Image for "{locationName}":</p>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: "300px" }} />
        </div>
      )}
    </div>
  );
}
