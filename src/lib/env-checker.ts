/**
 * Environment Variables Diagnostic Checker for Little Bro Assistant
 * Validates critical system environment variables and returns a health report.
 */

export interface EnvCheckResult {
  key: string;
  label: string;
  status: "OK" | "WARNING" | "ERROR";
  valueMasked: string;
  message: string;
  isCritical: boolean;
}

export interface SystemEnvHealthReport {
  overallStatus: "HEALTHY" | "DEGRADED" | "CRITICAL";
  passedCount: number;
  warningCount: number;
  errorCount: number;
  details: EnvCheckResult[];
}

export function validateEnvironmentVariables(): SystemEnvHealthReport {
  const envConfigs = [
    {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      label: "Supabase Project URL",
      isCritical: true,
      validate: (val?: string) => {
        if (!val) return { status: "ERROR", msg: "ขาดการตั้งค่า NEXT_PUBLIC_SUPABASE_URL ใน .env.local" };
        if (val.includes("placeholder")) return { status: "ERROR", msg: "ค่าเป็น placeholder กรุณาระบุ URL จริง" };
        if (!val.startsWith("https://")) return { status: "WARNING", msg: "ควรเริ่มต้นด้วย https://" };
        return { status: "OK", msg: "พร้อมใช้งาน" };
      }
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      label: "Supabase Anon / Publishable Key",
      isCritical: true,
      validate: (val?: string) => {
        const altKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const target = val || altKey;
        if (!target) return { status: "ERROR", msg: "ขาดการตั้งค่า Supabase API Key ใน .env.local" };
        if (target.includes("placeholder")) return { status: "ERROR", msg: "ค่าเป็น placeholder กรุณาระบุ API Key จริง" };
        return { status: "OK", msg: "พร้อมใช้งาน" };
      }
    },
    {
      key: "GOOGLE_APPS_SCRIPT_URL",
      label: "Google Apps Script Backend Web App URL",
      isCritical: true,
      validate: (val?: string) => {
        const altUrl = process.env.NEXT_PUBLIC_BACKEND_GAS_URL;
        const target = val || altUrl;
        if (!target) return { status: "ERROR", msg: "ขาดการตั้งค่า GOOGLE_APPS_SCRIPT_URL" };
        if (target.includes("placeholder")) return { status: "WARNING", msg: "ใช้งานระบบจำลอง (Placeholder)" };
        if (!target.includes("script.google.com")) return { status: "WARNING", msg: "URL ไม่อยู่บน domain script.google.com" };
        return { status: "OK", msg: "พร้อมใช้งาน" };
      }
    },
    {
      key: "GOOGLE_SPREADSHEET_ID",
      label: "Google Spreadsheet ID",
      isCritical: true,
      validate: (val?: string) => {
        if (!val) return { status: "ERROR", msg: "ขาดการตั้งค่า GOOGLE_SPREADSHEET_ID" };
        if (val.includes("placeholder")) return { status: "WARNING", msg: "ใช้งาน ID สเปรดชีตสำรอง" };
        return { status: "OK", msg: "พร้อมใช้งาน" };
      }
    },
    {
      key: "TELEGRAM_BOT_TOKEN",
      label: "Telegram Bot API Token",
      isCritical: false,
      validate: (val?: string) => {
        if (!val) return { status: "WARNING", msg: "ไม่ได้ตั้งค่า Telegram Bot Token (แชทบอท Telegram จะใช้โหมดจำลอง)" };
        return { status: "OK", msg: "พร้อมใช้งาน" };
      }
    },
    {
      key: "LINE_CHANNEL_ACCESS_TOKEN",
      label: "LINE Messaging Channel Token",
      isCritical: false,
      validate: (val?: string) => {
        if (!val) return { status: "WARNING", msg: "ไม่ได้ตั้งค่า LINE Token (แชทบอท LINE จะใช้โหมดจำลอง)" };
        return { status: "OK", msg: "พร้อมใช้งาน" };
      }
    }
  ];

  let passedCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  const details: EnvCheckResult[] = [];

  for (const cfg of envConfigs) {
    const rawVal = process.env[cfg.key];
    const validation = cfg.validate(rawVal);
    const status = validation.status as "OK" | "WARNING" | "ERROR";

    if (status === "OK") passedCount++;
    else if (status === "WARNING") warningCount++;
    else if (status === "ERROR") errorCount++;

    let masked = "NOT_SET";
    if (rawVal) {
      if (rawVal.length <= 10) masked = rawVal.substring(0, 3) + "***";
      else masked = rawVal.substring(0, 6) + "..." + rawVal.substring(rawVal.length - 4);
    }

    details.push({
      key: cfg.key,
      label: cfg.label,
      status,
      valueMasked: masked,
      message: validation.msg,
      isCritical: cfg.isCritical
    });
  }

  let overallStatus: "HEALTHY" | "DEGRADED" | "CRITICAL" = "HEALTHY";
  if (errorCount > 0) overallStatus = "CRITICAL";
  else if (warningCount > 0) overallStatus = "DEGRADED";

  return {
    overallStatus,
    passedCount,
    warningCount,
    errorCount,
    details
  };
}
