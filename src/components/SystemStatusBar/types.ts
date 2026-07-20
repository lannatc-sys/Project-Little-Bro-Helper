export type ServiceStatusType = "connected" | "connecting" | "disconnected" | "disabled" | "syncing";

export interface ServiceItem {
  id: string;
  name: string;
  category: "AI & LLM" | "Database & Storage" | "Cloud & Hosting" | "Messaging & Social" | "Payments & Travel" | "Integrations";
  icon: string; // Emoji or SVG string
  status: ServiceStatusType;
  lastSync: string;
  apiHealth: string; // e.g. "99.9% OK"
  authStatus: string; // e.g. "Authenticated as lannatc@gmail.com"
  version: string; // e.g. "v1.4.0"
  latency: number; // in ms
  notificationCount: number;
  description: string;
  endpointUrl?: string;
  docsUrl?: string;
}

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: "database",
    name: "Supabase DB",
    category: "Database & Storage",
    icon: "⚡",
    status: "connected",
    lastSync: "เมื่อสักครู่",
    apiHealth: "100% OK",
    authStatus: "Bearer Service Role Key OK",
    version: "v2.39.0",
    latency: 28,
    notificationCount: 0,
    description: "ฐานข้อมูลหลัก Supabase PostgreSQL สำหรับการจัดเก็บข้อมูลการเงินและโปรไฟล์",
    endpointUrl: "https://owdgklljykiisbdodjap.supabase.co"
  },
  {
    id: "gas",
    name: "Google Apps Script",
    category: "Database & Storage",
    icon: "📊",
    status: "connected",
    lastSync: "1 นาทีที่แล้ว",
    apiHealth: "99.8% OK",
    authStatus: "OAuth2 Exec Web App Validated",
    version: "v1.4.0",
    latency: 145,
    notificationCount: 0,
    description: "แบคเอนด์ประมวลผลคำสั่งชีต 6 ตารางบน Google Spreadsheet",
    endpointUrl: "https://script.google.com/macros/s/.../exec"
  },
  {
    id: "chatgpt",
    name: "ChatGPT (OpenAI)",
    category: "AI & LLM",
    icon: "🤖",
    status: "connected",
    lastSync: "3 นาทีที่แล้ว",
    apiHealth: "99.9% Operational",
    authStatus: "API Key (gpt-4o / gpt-4o-mini)",
    version: "v4.0.0",
    latency: 310,
    notificationCount: 0,
    description: "โมเดลประมวลผลภาษาธรรมชาติ OpenAI GPT-4o สำหรับผู้ช่วยอัจฉริยะ"
  },
  {
    id: "antigravity",
    name: "Antigravity IDE",
    category: "Integrations",
    icon: "🪐",
    status: "connected",
    lastSync: "เมื่อสักครู่",
    apiHealth: "Active 2.0 (AGY Engine)",
    authStatus: "Local AntiGravity Environment",
    version: "v2.0.0",
    latency: 5,
    notificationCount: 0,
    description: "Antigravity Agentic IDE & CLI Environment Context Protocol"
  },
  {
    id: "github",
    name: "GitHub Sync",
    category: "Cloud & Hosting",
    icon: "🐙",
    status: "connected",
    lastSync: "เมื่อสักครู่",
    apiHealth: "100% Repository Synced",
    authStatus: "SSH Key / Personal Access Token OK",
    version: "v1.4.0",
    latency: 85,
    notificationCount: 0,
    description: "ระบบควบคุมเวอร์ชันและ Deploy Code อัตโนมัติไปยัง Vercel Production",
    endpointUrl: "https://github.com/lannatc-sys/Project-Little-Bro-Helper"
  },
  {
    id: "telegram",
    name: "Telegram Bot API",
    category: "Messaging & Social",
    icon: "✈️",
    status: "connected",
    lastSync: "เมื่อสักครู่",
    apiHealth: "Active Webhook",
    authStatus: "Bot Token Configured (@bot)",
    version: "v6.3.0",
    latency: 42,
    notificationCount: 0,
    description: "บอทส่งข้อความแจ้งเตือนด่วนผ่าน Telegram"
  },
  {
    id: "gcalendar",
    name: "Google Calendar",
    category: "Integrations",
    icon: "📅",
    status: "syncing",
    lastSync: "กำลังซิงก์...",
    apiHealth: "Syncing Events",
    authStatus: "Google OAuth2 Token",
    version: "v3.0.0",
    latency: 190,
    notificationCount: 0,
    description: "ระบบปฏิทินและนัดหมายอัตโนมัติของ Google Calendar"
  },
  {
    id: "gmail",
    name: "Gmail Service",
    category: "Integrations",
    icon: "✉️",
    status: "connected",
    lastSync: "5 นาทีที่แล้ว",
    apiHealth: "Operational",
    authStatus: "Authenticated as lannatc@gmail.com",
    version: "v1.0.0",
    latency: 110,
    notificationCount: 0,
    description: "ระบบส่งอีเมลแจ้งเตือนใบเสร็จและรายงานสรุปการเงิน"
  },
  {
    id: "gdrive",
    name: "Google Drive",
    category: "Database & Storage",
    icon: "📁",
    status: "connected",
    lastSync: "10 นาทีที่แล้ว",
    apiHealth: "Operational",
    authStatus: "Google Drive Access Authorized",
    version: "v3.0.0",
    latency: 205,
    notificationCount: 0,
    description: "ระบบจัดเก็บไฟล์สลิปและเอกสารสำรอง"
  },
  {
    id: "vercel",
    name: "Vercel Edge Platform",
    category: "Cloud & Hosting",
    icon: "▲",
    status: "connected",
    lastSync: "เมื่อสักครู่",
    apiHealth: "100% Deployed",
    authStatus: "Vercel Production Deployment",
    version: "v16.2.10",
    latency: 18,
    notificationCount: 0,
    description: "แพลตฟอร์มโฮสติ้งเซิร์ฟเวอร์เลส Next.js Turbopack",
    endpointUrl: "https://vercel.com"
  },
  {
    id: "cloudflare",
    name: "Cloudflare DNS & CDN",
    category: "Cloud & Hosting",
    icon: "🟠",
    status: "connected",
    lastSync: "เมื่อสักครู่",
    apiHealth: "100% Protected",
    authStatus: "SSL/TLS & Anti-DDoS Enabled",
    version: "v2.0.0",
    latency: 12,
    notificationCount: 0,
    description: "เครือข่ายความปลอดภัยและ CDN เร่งความเร็วทั่วโลก"
  },
  {
    id: "stripe",
    name: "Stripe Billing",
    category: "Payments & Travel",
    icon: "💳",
    status: "connected",
    lastSync: "15 นาทีที่แล้ว",
    apiHealth: "Operational",
    authStatus: "Stripe Live API Key",
    version: "v2023-10-16",
    latency: 160,
    notificationCount: 0,
    description: "ระบบชำระเงินและรับสมาชิกแบบรายเดือน (SaaS Subscription)"
  },
  {
    id: "booking",
    name: "Booking.com API",
    category: "Payments & Travel",
    icon: "🏨",
    status: "connecting",
    lastSync: "กำลังเชื่อมต่อ...",
    apiHealth: "Initializing Partner API",
    authStatus: "Partner Credentials Loaded",
    version: "v2.1.0",
    latency: 280,
    notificationCount: 1,
    description: "โมดูลผู้ช่วยจองโรงแรมและที่พักสำหรับการเดินทาง"
  },
  {
    id: "openrouter",
    name: "OpenRouter LLM Hub",
    category: "AI & LLM",
    icon: "🌐",
    status: "connected",
    lastSync: "2 นาทีที่แล้ว",
    apiHealth: "Operational",
    authStatus: "Multi-Model Fallback Key",
    version: "v1.2.0",
    latency: 220,
    notificationCount: 0,
    description: "ศูนย์กลางสลับใช้งาน AI หลายโมเดล (Claude, Gemini, Llama)"
  },
  {
    id: "mcp",
    name: "MCP Context Server",
    category: "Integrations",
    icon: "🧩",
    status: "connected",
    lastSync: "เมื่อสักครู่",
    apiHealth: "Operational",
    authStatus: "Model Context Protocol Listening",
    version: "v1.0.0",
    latency: 8,
    notificationCount: 0,
    description: "เซิร์ฟเวอร์โปรโตคอลบริบท Antigravity MCP สำหรับสื่อสารระหว่าง AI Agents"
  }
];
