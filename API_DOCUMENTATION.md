# API Documentation - Environment Monitoring System

## Overview
This API provides endpoints for managing IoT devices with camera and environmental sensors. Devices can upload images with license plate detection and environmental data (temperature, humidity, rain status).

## Base URL
```
http://localhost:3000/api
```

---

## Endpoints

### 1. Get All Devices
**GET** `/api/devices`

Returns a list of all devices with their images and environmental data.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Camera Hồ Gươm",
    "lat": 21.0285,
    "lng": 105.8542,
    "description": "Thiết bị quan sát tại Hồ Gươm, Hà Nội",
    "lastUploadAt": "2025-01-13T10:30:00.000Z",
    "isFogging": false,
    "isRoadSlippery": false,
    "isLandslide": false,
    "images": [
      {
        "url": "/uploads/1234567890-image.jpg",
        "licensePlate": "29A-12345",
        "createdAt": "2025-01-13T10:30:00.000Z"
      }
    ],
    "environmentData": [
      {
        "temperature": 25.5,
        "humidity": 70.0,
        "isRaining": false,
        "createdAt": "2025-01-13T10:30:00.000Z"
      }
    ],
    "latestEnvironment": {
      "temperature": 25.5,
      "humidity": 70.0,
      "isRaining": false,
      "createdAt": "2025-01-13T10:30:00.000Z"
    }
  }
]
```

---

### 2. Upload Image
**POST** `/api/devices/[id]/upload`

Upload an image from a Raspberry Pi device with optional license plate detection.

**Parameters:**
- `id` (path): Device ID

**Form Data:**
- `file` (required): Image file
- `title` (optional): Image title
- `content` (optional): Image description
- `licensePlate` (optional): Detected license plate number

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/devices/1/upload \
  -F "file=@/path/to/image.jpg" \
  -F "title=Traffic Camera Snapshot" \
  -F "content=Captured at intersection" \
  -F "licensePlate=29A-12345"
```

**Response:**
```json
{
  "success": true,
  "filename": "1705142400000-image.jpg",
  "title": "Traffic Camera Snapshot",
  "content": "Captured at intersection",
  "licensePlate": "29A-12345"
}
```

---

### 3. Upload Environment Data
**POST** `/api/devices/[id]/environment`

Upload environmental sensor data from a Raspberry Pi device.

**Parameters:**
- `id` (path): Device ID

**Request Body (JSON):**
```json
{
  "temperature": 25.5,
  "humidity": 70.0,
  "isRaining": false,
  "isLandslide": false
}
```

**Fields:**
- `temperature` (required): Temperature in Celsius (Float)
- `humidity` (required): Humidity percentage 0-100 (Float)
- `isRaining` (required): Current rain status (Boolean)
- `isLandslide` (optional): Landslide detection status (Boolean)

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/devices/1/environment \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 25.5,
    "humidity": 70.0,
    "isRaining": false,
    "isLandslide": false
  }'
```

**Response:**
```json
{
  "success": true,
  "environmentData": {
    "id": 123,
    "temperature": 25.5,
    "humidity": 70.0,
    "isRaining": false,
    "deviceId": 1,
    "createdAt": "2025-01-13T10:30:00.000Z"
  },
  "deviceStatus": {
    "isFogging": false,
    "isRoadSlippery": false,
    "isLandslide": false
  }
}
```

**Automatic Status Calculations:**
- `isFogging`: Automatically set to `true` when humidity > 95% AND temperature < 20°C
- `isRoadSlippery`: Automatically set to `true` when it has been raining continuously for more than 10 minutes
- `isLandslide`: Only updated when explicitly provided in the request

---

### 4. Get Environment History
**GET** `/api/devices/[id]/environment`

Retrieve historical environmental data for a specific device.

**Parameters:**
- `id` (path): Device ID
- `limit` (query, optional): Number of records to return (default: 50)

**Example:**
```bash
curl http://localhost:3000/api/devices/1/environment?limit=100
```

**Response:**
```json
{
  "deviceId": 1,
  "count": 100,
  "data": [
    {
      "id": 123,
      "temperature": 25.5,
      "humidity": 70.0,
      "isRaining": false,
      "deviceId": 1,
      "createdAt": "2025-01-13T10:30:00.000Z"
    }
  ]
}
```

---

## Device Status Indicators

### isFogging
- **Condition**: `humidity > 95%` AND `temperature < 20°C`
- **Auto-calculated**: Yes
- **Use case**: Alert drivers about foggy conditions

### isRoadSlippery
- **Condition**: Continuous rain for more than 10 minutes
- **Auto-calculated**: Yes
- **Use case**: Warn about slippery road conditions

### isLandslide
- **Condition**: Manually detected by device sensors
- **Auto-calculated**: No
- **Use case**: Emergency alert for landslide detection

---

## Raspberry Pi Integration Examples

### Complete Monitoring Script (Python)
```python
import requests
import time
from datetime import datetime

DEVICE_ID = 1
BASE_URL = "http://localhost:3000/api"

def upload_image(image_path, license_plate=None):
    url = f"{BASE_URL}/devices/{DEVICE_ID}/upload"
    
    files = {'file': open(image_path, 'rb')}
    data = {
        'title': f'Snapshot {datetime.now().isoformat()}',
        'content': 'Automated capture'
    }
    
    if license_plate:
        data['licensePlate'] = license_plate
    
    response = requests.post(url, files=files, data=data)
    return response.json()

def upload_environment_data(temperature, humidity, is_raining, is_landslide=False):
    url = f"{BASE_URL}/devices/{DEVICE_ID}/environment"
    
    data = {
        'temperature': temperature,
        'humidity': humidity,
        'isRaining': is_raining,
        'isLandslide': is_landslide
    }
    
    response = requests.post(url, json=data)
    return response.json()

# Example usage
while True:
    # Read sensors (pseudo-code)
    temp = read_temperature_sensor()
    humidity = read_humidity_sensor()
    is_raining = read_rain_sensor()
    
    # Upload environment data
    env_result = upload_environment_data(temp, humidity, is_raining)
    print(f"Environment data uploaded: {env_result}")
    
    # Capture and upload image every 5 minutes
    if time.time() % 300 < 1:
        image_path = capture_image()
        license_plate = detect_license_plate(image_path)
        img_result = upload_image(image_path, license_plate)
        print(f"Image uploaded: {img_result}")
    
    time.sleep(60)  # Wait 1 minute
```

### Bash Script Example
```bash
#!/bin/bash

DEVICE_ID=1
BASE_URL="http://localhost:3000/api"

# Upload image
curl -X POST "$BASE_URL/devices/$DEVICE_ID/upload" \
  -F "file=@/home/pi/capture.jpg" \
  -F "title=Camera snapshot" \
  -F "content=Snapshot at $(date)" \
  -F "licensePlate=29A-12345"

# Upload environment data
curl -X POST "$BASE_URL/devices/$DEVICE_ID/environment" \
  -H "Content-Type: application/json" \
  -d "{
    \"temperature\": 25.5,
    \"humidity\": 70.0,
    \"isRaining\": false
  }"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: temperature, humidity, isRaining"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to process environment data"
}
```

---

## Database Schema

### Device
- `id`: Integer (Primary Key)
- `title`: String
- `description`: String (Optional)
- `lat`: Float (Latitude)
- `lng`: Float (Longitude)
- `isFogging`: Boolean
- `isRoadSlippery`: Boolean
- `isLandslide`: Boolean
- `lastUploadAt`: DateTime (Optional)

### Image
- `id`: Integer (Primary Key)
- `url`: String (Filename)
- `title`: String (Optional)
- `content`: String (Optional)
- `licensePlate`: String (Optional)
- `deviceId`: Integer (Foreign Key)
- `createdAt`: DateTime

### EnvironmentData
- `id`: Integer (Primary Key)
- `temperature`: Float
- `humidity`: Float
- `isRaining`: Boolean
- `deviceId`: Integer (Foreign Key)
- `createdAt`: DateTime
