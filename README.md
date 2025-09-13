# Next.js OpenStreetMap Dashboard

## Cài đặt
```bash
npm install
npm run dev
```

## Mô tả
- Hiển thị bản đồ OpenStreetMap bằng react-leaflet
- Marker cho từng thiết bị (Raspberry Pi + Cam)
- Click marker -> mở panel bên phải hiển thị thông tin + hình ảnh
- API cho Raspberry Pi gửi dữ liệu hình ảnh, tiêu đề, nội dung

## API
- `GET /api/devices` : Danh sách thiết bị
- `GET /api/devices/[id]` : Chi tiết thiết bị
- `POST /api/devices/[id]/upload` : Raspberry Pi gửi ảnh + metadata

## Gửi dữ liệu từ Raspberry Pi
```bash
curl -X POST http://localhost:3000/api/devices/1/upload   -F "file=@/home/pi/capture.jpg"   -F "title=Camera snapshot"   -F "content=Snapshot at $(date)"
```
