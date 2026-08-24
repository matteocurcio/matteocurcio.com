export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === "www.matteocurcio.com") {
    url.protocol = "https:";
    url.hostname = "matteocurcio.com";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
