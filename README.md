# Next.js OpenStreetMap Dashboard - Environment Monitoring System

## Cài đặt
```bash
npm install
npx prisma migrate dev
npx prisma generate
npm run seed
npm run dev
```

## Mô tả
- Hiển thị bản đồ OpenStreetMap bằng react-leaflet
- Marker cho từng thiết bị (Raspberry Pi + Cam + Sensors)
- Click marker -> mở panel bên phải hiển thị thông tin + hình ảnh
- **Giám sát môi trường**: Nhiệt độ, độ ẩm, mưa
- **Cảnh báo tự động**: Sương mù, đường trơn, sạt lở đất
- **Nhận diện biển số xe** từ hình ảnh camera
- API cho Raspberry Pi gửi dữ liệu hình ảnh và môi trường

## Tính năng mới

### 1. Giám sát môi trường
- **Nhiệt độ** (°C)
- **Độ ẩm** (%)
- **Trạng thái mưa** (có/không)

### 2. Cảnh báo tự động
- **Sương mù (isFogging)**: Tự động phát hiện khi độ ẩm > 95% VÀ nhiệt độ < 20°C
- **Đường trơn (isRoadSlippery)**: Tự động cảnh báo khi mưa liên tục > 10 phút
- **Sạt lở đất (isLandslide)**: Cảnh báo thủ công từ cảm biến thiết bị

### 3. Nhận diện biển số xe
- Lưu trữ biển số xe được phát hiện từ camera
- Hiển thị cùng với hình ảnh

## API Endpoints

### Thiết bị
- `GET /api/devices` : Danh sách thiết bị + dữ liệu môi trường
- `POST /api/devices/[id]/upload` : Upload ảnh + biển số xe
- `POST /api/devices/[id]/environment` : Upload dữ liệu môi trường
- `GET /api/devices/[id]/environment` : Lịch sử dữ liệu môi trường

## Ví dụ sử dụng từ Raspberry Pi

### 1. Gửi hình ảnh với biển số xe
```bash
curl -X POST http://localhost:3000/api/devices/1/upload \
  -F "file=@/home/pi/capture.jpg" \
  -F "title=Camera snapshot" \
  -F "content=Snapshot at $(date)" \
  -F "licensePlate=29A-12345"
```

### 2. Gửi dữ liệu môi trường
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

### 3. Xem lịch sử môi trường
```bash
curl http://localhost:3000/api/devices/1/environment?limit=100
```

## Script Python cho Raspberry Pi

```python
import requests
import time

DEVICE_ID = 1
BASE_URL = "http://localhost:3000/api"

def upload_environment_data(temp, humidity, is_raining):
    url = f"{BASE_URL}/devices/{DEVICE_ID}/environment"
    data = {
        'temperature': temp,
        'humidity': humidity,
        'isRaining': is_raining
    }
    response = requests.post(url, json=data)
    return response.json()

# Gửi dữ liệu mỗi phút
while True:
    temp = read_temperature_sensor()
    humidity = read_humidity_sensor()
    is_raining = read_rain_sensor()
    
    result = upload_environment_data(temp, humidity, is_raining)
    print(f"Uploaded: {result}")
    
    time.sleep(60)
```

## Database Schema

### Device
- Thông tin vị trí (lat, lng)
- Trạng thái: isFogging, isRoadSlippery, isLandslide
- Quan hệ: images[], envirs[]

### Image
- URL hình ảnh
- **licensePlate**: Biển số xe phát hiện được
- Metadata: title, content

### EnvironmentData
- temperature: Nhiệt độ (°C)
- humidity: Độ ẩm (%)
- isRaining: Trạng thái mưa
- Timestamp: createdAt

## Tài liệu chi tiết
Xem [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) để biết thêm chi tiết về API và cách tích hợp.
