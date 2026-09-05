import { NextResponse } from "next/server";

/** El formulario de la home hace GET /verify?folio=X → redirige a /verify/X */
export function GET(request: Request) {
  const folio = new URL(request.url).searchParams.get("folio")?.trim();
  if (!folio) return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.redirect(
    new URL(`/verify/${encodeURIComponent(folio)}`, request.url)
  );
}
