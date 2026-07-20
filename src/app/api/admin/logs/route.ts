import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type");

  const logs = [
    {
      id: "log-001",
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      type: "Activity",
      level: "INFO",
      source: "AuthService",
      message: "Admin user lannatc@gmail.com authenticated via Google OAuth 2.0."
    },
    {
      id: "log-002",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      type: "Deploy",
      level: "SUCCESS",
      source: "VercelDeployment",
      message: "Deploy commit 2fa8552 (feat(admin): System Status API - GET /api/admin/status) succeeded."
    },
    {
      id: "log-003",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      type: "Warning",
      level: "WARN",
      source: "LineService",
      message: "LINE Push API returned missing recipient user_id fallback guidance."
    },
    {
      id: "log-004",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      type: "Error",
      level: "ERROR",
      source: "SupabaseClient",
      message: "REST Endpoint returned 401 Unauthorized before fail-fast header patch."
    },
    {
      id: "log-005",
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      type: "Activity",
      level: "INFO",
      source: "DatabaseSync",
      message: "Auto-provisioned Google Spreadsheet workspace for user session."
    }
  ];

  if (typeFilter) {
    const filtered = logs.filter(l => l.type.toLowerCase() === typeFilter.toLowerCase());
    return NextResponse.json({ status: "success", count: filtered.length, logs: filtered });
  }

  return NextResponse.json({
    status: "success",
    count: logs.length,
    categories: ["Error", "Warning", "Deploy", "Activity"],
    logs
  });
}
