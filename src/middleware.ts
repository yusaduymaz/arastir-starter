import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)"],
  async afterAuth(auth, req, evt) {
    // If the user is trying to access an admin route
    if (req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/api/admin")) {
      if (!auth.userId) {
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(signInUrl);
      }

      // We need to fetch the role from Supabase
      // Using service_role client to bypass RLS since we are on the server
      // and Clerk is our auth provider (Supabase doesn't know about auth.uid())
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", auth.userId)
        .single();

      if (error || !data || data.role !== "admin") {
        if (req.nextUrl.pathname.startsWith("/api/admin")) {
          return new NextResponse("Forbidden", { status: 403 });
        }
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
