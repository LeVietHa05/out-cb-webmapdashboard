'use client';

import dynamic from "next/dynamic";

// Load component bản đồ bằng dynamic import (chỉ chạy ở client)
const MapPage = dynamic(() => import("./map"), { ssr: false });

export default function Home() {
  return <MapPage />;
}
