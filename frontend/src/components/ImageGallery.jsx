import React, { useState } from "react";

export default function ImageUploader({ locationName }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

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
      const response = await fetch(
        "https://0xi0ck7hti.execute-api.us-east-1.amazonaws.com/generateSignedUrl",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileType }),
        }
      );

      if (!response.ok) throw new Error("Failed to get signed URL");

      const { uploadUrl, imageUrl } = await response.json();

      // 2. Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": fileType },
        body: selectedFile,
      });

      if (!uploadResponse.ok) throw new Error("Upload to S3 failed");

      // 3. Send metadata to backend
      await fetch("https://0xi0ck7hti.execute-api.us-east-1.amazonaws.com/saveImageMetadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationName,
          imageUrl,
        }),
      });

      setImageUrl(imageUrl);
      setSelectedFile(null);
    } catch (err) {
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
      {imageUrl && (
        <div>
          <p>Uploaded Image:</p>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: "300px" }} />
        </div>
      )}
    </div>
  );
}
