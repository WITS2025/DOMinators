exports.handler = async (event) => {
    try {
      const body = JSON.parse(event.body);
      const { fileType } = body;  // no locationId now
  
      if (!fileType) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing fileType" }),
        };
      }
  
      const extension = fileType.split('/')[1] || 'jpg';
      const key = `uploads/${uuidv4()}.${extension}`;  // simpler path
  
      const params = {
        Bucket: bucketName,
        Key: key,
        ContentType: fileType,
        Expires: 300,
      };
  
      const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
      const imageUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
  
      // Optional: you can skip DB update since no locationId
  
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadUrl,
          imageUrl,
        }),
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server error' }),
      };
    }
  };