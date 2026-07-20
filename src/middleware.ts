import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected Admin Routes
  if (pathname.startsWith("/admin/dashboard")) {
    const adminSession = request.cookies.get("little_bro_admin_session")?.value;
    const userEmail = request.cookies.get("little_bro_email")?.value;

    // Strict Admin Verification
    const isAuthorizedAdmin = adminSession === "true" || userEmail === "lannatc@gmail.com";

    if (!isAuthorizedAdmin) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protected Admin API Routes
  if (pathname.startsWith("/api/admin")) {
    const adminHeader = request.headers.get("x-admin-email");
    const adminSession = request.cookies.get("little_bro_admin_session")?.value;
    
    if (adminHeader !== "lannatc@gmail.com" && adminSession !== "true") {
      return NextResponse.json(
        { status: "error", message: "403 Forbidden: Administrator permissions required." },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
