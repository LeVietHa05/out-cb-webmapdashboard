const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function uploadFile() {
  const form = new FormData();
  const filePath = path.join(__dirname, 'public', 'marker-icon-2x.png');
  form.append('file', fs.createReadStream(filePath));
  form.append('title', 'Test Image');
  form.append('content', 'Test upload');

  try {
    const response = await axios.post('http://localhost:3002/api/devices/1/upload', form, {
      headers: form.getHeaders(),
    });
    console.log('Upload response:', response.data);
  } catch (error) {
    console.error('Upload error:', error.response ? error.response.data : error.message);
  }
}

uploadFile();
