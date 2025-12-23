import { Elysia } from "elysia";
import { folderRoutes } from "./folderRoutes";

export const v1Routes = new Elysia({ prefix: "/v1" })
  .use(folderRoutes);
