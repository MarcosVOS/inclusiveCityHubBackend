export async function statusRoutes(app) {
  app.get("/", async function alive(request, reply) {
    return reply.status(200).send({ status: "ok" });
  });
}
