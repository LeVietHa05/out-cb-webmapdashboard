# Multi-Status Marker System

## Overview
The map now features an advanced marker system that displays multiple status indicators simultaneously on each device marker.

## Marker Components

### 1. Base Marker (Main Pin)
**Color Coding:**
- 🔴 **Red** - Active device (uploaded within last 60 seconds)
- 🟢 **Green** - Inactive device (no recent uploads)

**Size:**
- Active: 40px
- Inactive: 30px

**Features:**
- Pulsing animation for visual attention
- Pin-shaped design (teardrop)
- 📍 emoji icon in center
- Hover effect (scales up 10%)
- Drop shadow for depth

### 2. Status Badges
Small circular badges displayed below the main marker showing various conditions:

#### Badge Types:

1. **⚠️ Landslide Warning** (Red Badge)
   - Color: `#dc2626` (red-600)
   - Triggers: When `isLandslide = true`
   - Tooltip: "Cảnh báo sạt lở"

2. **🌧️ Road Slippery** (Orange Badge)
   - Color: `#f97316` (orange-500)
   - Triggers: When `isRoadSlippery = true`
   - Tooltip: "Đường trơn trượt"

3. **🌫️ Fogging** (Yellow Badge)
   - Color: `#eab308` (yellow-500)
   - Triggers: When `isFogging = true`
   - Tooltip: "Sương mù"

4. **🚗 Car Detected** (Blue Badge)
   - Color: `#2563eb` (blue-600)
   - Triggers: When any image has a license plate
   - Tooltip: "Phát hiện xe"

## Visual Hierarchy

```
┌─────────────────┐
│   Main Marker   │  ← Base pin (red/green)
│      📍         │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Badges  │      ← Status indicators
    │ ⚠️🌧️🌫️🚗 │
    └─────────┘
```

## Badge Behavior

### Display Rules:
- Badges only appear when their condition is true
- Multiple badges can display simultaneously
- Badges are arranged horizontally below the marker
- Maximum 4 badges per marker
- Badges wrap if needed (max width: 80px)

### Interactions:
- **Hover**: Badge scales up 20% for better visibility
- **Tooltip**: Shows description on hover
- **Click**: Clicking marker (including badges) opens device details

## CSS Classes

### Main Classes:
- `.custom-div-icon` - Container for custom marker
- `.custom-marker-container` - Flex container for marker + badges
- `.main-marker` - The pin-shaped marker
- `.marker-pulse` - Pulsing animation layer
- `.marker-icon` - Emoji icon inside marker
- `.status-badges` - Container for badge group
- `.status-badge` - Individual badge

### Color Classes:
- `.bg-red-600` - Landslide
- `.bg-orange-500` - Road slippery
- `.bg-yellow-500` - Fogging
- `.bg-blue-600` - Car detected

## Implementation Details

### Marker Creation Logic:
```typescript
const createCustomMarker = (device: Device) => {
    // 1. Check device activity status
    const isActive = isDeviceActive(device);
    
    // 2. Check for car detection
    const hasCars = hasDetectedCars(device);
    
    // 3. Determine base color and size
    const baseColor = isActive ? '#ef4444' : '#22c55e';
    const markerSize = isActive ? 40 : 30;
    
    // 4. Build badges array
    const badges = [];
    if (device.isLandslide) badges.push(landslide badge);
    if (device.isRoadSlippery) badges.push(slippery badge);
    if (device.isFogging) badges.push(fogging badge);
    if (hasCars) badges.push(car badge);
    
    // 5. Generate HTML and create DivIcon
    return new DivIcon({ html, className, iconSize, iconAnchor });
};
```

### Status Detection:

**Active Device:**
```typescript
const isDeviceActive = (device: Device) => {
    if (device.lastUploadAt) {
        const timeDiff = Date.now() - new Date(device.lastUploadAt).getTime();
        return timeDiff <= 60000; // 60 seconds
    }
    return false;
};
```

**Car Detection:**
```typescript
const hasDetectedCars = (device: Device) => {
    return device.images?.some(img => img.licensePlate) || false;
};
```

## Animations

### Pulse Effect:
```css
@keyframes pulse {
    0% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.2); opacity: 0.3; }
    100% { transform: scale(1); opacity: 0.6; }
}
```
- Duration: 2 seconds
- Infinite loop
- Applied to active markers only

### Hover Effects:
- Main marker: `scale(1.1)` + enhanced shadow
- Badges: `scale(1.2)` + z-index elevation

## Responsive Design

### Mobile Adjustments:
```css
@media (max-width: 768px) {
    .status-badge {
        width: 18px;
        height: 18px;
        font-size: 10px;
    }
}
```

## Example Scenarios

### Scenario 1: Normal Device
- Green marker (30px)
- No badges
- No pulse animation

### Scenario 2: Active Device with Car
- Red marker (40px)
- Blue car badge 🚗
- Pulsing animation

### Scenario 3: Critical Situation
- Red marker (40px)
- Red landslide badge ⚠️
- Orange slippery badge 🌧️
- Yellow fog badge 🌫️
- Blue car badge 🚗
- Pulsing animation

### Scenario 4: Weather Warning
- Green marker (30px)
- Orange slippery badge 🌧️
- Yellow fog badge 🌫️

## Performance Considerations

1. **Marker Recreation**: Markers are recreated on every render
2. **Badge Calculation**: Status checks run for each device
3. **HTML Generation**: Dynamic HTML string creation
4. **CSS Animations**: GPU-accelerated transforms

## Future Enhancements

Potential improvements:
- [ ] Badge priority ordering (critical first)
- [ ] Badge count indicator (e.g., "+2 more")
- [ ] Animated badge transitions
- [ ] Custom badge colors per severity
- [ ] Badge click handlers for quick actions
- [ ] Marker clustering for dense areas
- [ ] Badge tooltips with more details

## Troubleshooting

### Badges Not Showing:
1. Check device data has correct boolean flags
2. Verify CSS file is imported
3. Check browser console for errors
4. Ensure DivIcon is properly created

### Styling Issues:
1. Clear browser cache
2. Check CSS class names match
3. Verify Tailwind classes are available
4. Inspect element in DevTools

### Performance Issues:
1. Limit number of devices on map
2. Implement marker clustering
3. Debounce marker updates
4. Use React.memo for optimization
