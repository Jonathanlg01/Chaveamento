import { NextRequest, NextResponse } from "next/server";
import { decryptFromCookieValue } from "@/lib/session";

// Rotas que exigem autenticação (todas as sub-rotas também)
const PROTECTED_PATHS = ["/dashboard"];
// Rotas públicas — se estiver logado e acessar, redireciona ao dashboard
const PUBLIC_AUTH_PATHS = ["/", "/register"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isPublicAuth = PUBLIC_AUTH_PATHS.includes(pathname);

  // Ler token do cookie direto do request (middleware não usa next/headers)
  const cookieValue = req.cookies.get("chv_session")?.value;
  const session = await decryptFromCookieValue(cookieValue);

  // Redirecionar para login se tentar acessar rota protegida sem sessão
  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Se já está logado e tenta acessar a página de login, vai para o dashboard
  if (isPublicAuth && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - arquivos com extensão (ex: .png, .svg, .jpg)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|eot)$).*)",
  ],
};
