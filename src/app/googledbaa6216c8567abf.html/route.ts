export async function GET() {
  return new Response(
    "google-site-verification: googledbaa6216c8567abf.html",
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
}
