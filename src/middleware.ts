import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "travis_admin";

/**
 * Garde d'accès du back-office.
 *
 * Le middleware s'exécute sur l'edge runtime, où `node:crypto` n'est pas
 * disponible : il ne fait donc qu'un filtrage de présence, et la vérification
 * de signature a lieu dans le layout `/admin`, côté Node. Ce n'est pas une
 * défense en soi — c'est une redirection propre qui évite de rendre la page
 * avant de découvrir qu'elle est interdite.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/connexion") return NextResponse.next();

  if (!request.cookies.get(COOKIE)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/connexion";
    url.searchParams.set("suite", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
