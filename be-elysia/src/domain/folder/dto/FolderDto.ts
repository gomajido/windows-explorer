import { t } from "elysia";

// Request Types
export interface CreateFolderRequest {
  name: string;
  parentId?: number | null;
  isFolder?: boolean;
}

export interface UpdateFolderRequest {
  name: string;
}

export interface GetFolderParams {
  id: string;
}

export interface SearchFolderQuery {
  q?: string;
}

// Validation Schemas (Elysia TypeBox)
export const FolderSchema = {
  params: {
    id: t.Object({ id: t.String() }),
  },
  query: {
    search: t.Object({ q: t.Optional(t.String()) }),
  },
  body: {
    create: t.Object({
      name: t.String({ minLength: 1 }),
      parentId: t.Optional(t.Union([t.Number(), t.Null()])),
      isFolder: t.Optional(t.Boolean()),
    }),
    update: t.Object({
      name: t.String({ minLength: 1 }),
    }),
  },
};
