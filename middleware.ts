import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const isAuthRoute = request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/sign-up');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

  try {
    const res = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    
    const session = res.ok ? await res.json() : null;

    if (isProtectedRoute && (!session || !session.session)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    if (isAuthRoute && session && session.session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

  } catch (error) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin', '/sign-up'],
};
