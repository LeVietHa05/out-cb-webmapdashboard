#!/bin/bash

# API Testing Script for Environment Monitoring System
# Make sure the server is running: npm run dev

BASE_URL="http://localhost:3000/api"
DEVICE_ID=1

echo "================================"
echo "Testing Environment Monitoring API"
echo "================================"
echo ""

# Test 1: Get all devices
echo "1. Testing GET /api/devices"
echo "----------------------------"
curl -s "$BASE_URL/devices" | jq '.'
echo ""
echo ""

# Test 2: Upload environment data
echo "2. Testing POST /api/devices/$DEVICE_ID/environment"
echo "----------------------------------------------------"
curl -s -X POST "$BASE_URL/devices/$DEVICE_ID/environment" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 22.5,
    "humidity": 85.0,
    "isRaining": true,
    "isLandslide": false
  }' | jq '.'
echo ""
echo ""

# Test 3: Upload environment data that triggers fogging
echo "3. Testing POST /api/devices/$DEVICE_ID/environment (Fogging Condition)"
echo "-----------------------------------------------------------------------"
curl -s -X POST "$BASE_URL/devices/$DEVICE_ID/environment" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 18.0,
    "humidity": 96.5,
    "isRaining": false
  }' | jq '.'
echo ""
echo ""

# Test 4: Get environment history
echo "4. Testing GET /api/devices/$DEVICE_ID/environment"
echo "---------------------------------------------------"
curl -s "$BASE_URL/devices/$DEVICE_ID/environment?limit=5" | jq '.'
echo ""
echo ""

# Test 5: Upload image with license plate (requires actual image file)
echo "5. Testing POST /api/devices/$DEVICE_ID/upload"
echo "-----------------------------------------------"
echo "Note: This test requires an actual image file."
echo "Example command:"
echo "curl -X POST $BASE_URL/devices/$DEVICE_ID/upload \\"
echo "  -F \"file=@/path/to/image.jpg\" \\"
echo "  -F \"title=Test Image\" \\"
echo "  -F \"content=Test upload\" \\"
echo "  -F \"licensePlate=29A-12345\""
echo ""
echo ""

# Test 6: Simulate continuous rain for road slippery detection
echo "6. Testing Road Slippery Detection (Continuous Rain)"
echo "-----------------------------------------------------"
echo "Uploading rain data every 2 seconds for 12 times (simulating 10+ minutes)..."
for i in {1..12}
do
  echo "Upload #$i..."
  curl -s -X POST "$BASE_URL/devices/$DEVICE_ID/environment" \
    -H "Content-Type: application/json" \
    -d '{
      "temperature": 20.0,
      "humidity": 80.0,
      "isRaining": true
    }' | jq '.deviceStatus.isRoadSlippery'
  sleep 2
done
echo ""
echo "Final check - should show isRoadSlippery: true"
curl -s "$BASE_URL/devices" | jq ".[0].isRoadSlippery"
echo ""
echo ""

echo "================================"
echo "Testing Complete!"
echo "================================"
