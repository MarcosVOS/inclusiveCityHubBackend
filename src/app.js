import fastify from "fastify";

import { statusRoutes } from "./routes/status.js";
import usersRoutes from "./routes/users.js";
import categoriesRoutes from "./routes/categories.js";
import sessionsRoutes from "./routes/sessions.js";
import eventsRoutes from "./routes/events.js";

const app = fastify({ logger: true });

app.register(statusRoutes);
app.register(usersRoutes);
app.register(categoriesRoutes);
app.register(sessionsRoutes);
app.register(eventsRoutes);

export default app;
