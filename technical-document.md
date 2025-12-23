================================================================================
                    WINDOWS EXPLORER CLONE - CLEAN ARCHITECTURE
================================================================================

PROJECT: Folder Explorer Web Application
TECH STACK: 
  - Backend: Elysia.js + Bun + TypeScript
  - Frontend: Vue.js 3 (Composition API) + Bun + TypeScript
  - Database: MySQL + Drizzle ORM
  - Styling: TailwindCSS
STRUCTURE: Monorepo (npm workspaces)

================================================================================
                              UI SPECIFICATION
================================================================================

    ┌────────────────────────────────────────────────────────────────────────┐
    │                         FOLDER EXPLORER                                │
    ├──────────────────────────┬─────────────────────────────────────────────┤
    │                          │                                             │
    │    LEFT PANEL            │    RIGHT PANEL                              │
    │    (Folder Tree)         │    (Direct Subfolders)                      │
    │                          │                                             │
    │    📁 Documents          │    Shows direct children of selected        │
    │      📁 Work             │    folder from left panel                   │
    │      📁 Personal         │                                             │
    │    📁 Downloads          │    Example: Click "Documents" shows:        │
    │    📁 Pictures           │      📁 Work                                │
    │      📁 Wallpapers       │      📁 Personal                            │
    │    📁 Music              │      📄 report.txt                          │
    │    📁 Videos             │      📄 notes.txt                           │
    │                          │                                             │
    └──────────────────────────┴─────────────────────────────────────────────┘

BEHAVIOR:
- On load: Fetch ALL folders → Display tree structure on LEFT panel
- On click folder: Display direct children (subfolders + files) on RIGHT panel
- Folders in LEFT panel: Expandable/collapsible (like Windows Explorer)
- Unlimited nesting levels supported

================================================================================
                              CLEAN ARCHITECTURE
================================================================================

Clean Architecture separates code into layers with clear dependencies:

    ┌─────────────────────────────────────────────────────────────────┐
    │                      PRESENTATION                               │
    │              (Controllers, Routes, UI Components)               │
    └─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                      APPLICATION                                │
    │                   (Use Cases / Services)                        │
    └─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                        DOMAIN                                   │
    │              (Entities, Interfaces/Ports)                       │
    └─────────────────────────────────────────────────────────────────┘
                                  ▲
                                  │
    ┌─────────────────────────────────────────────────────────────────┐
    │                     INFRASTRUCTURE                              │
    │              (Database/ORM, External APIs)                      │
    └─────────────────────────────────────────────────────────────────┘

KEY PRINCIPLE: Dependencies point INWARD (outer layers depend on inner layers)

================================================================================
                            PROJECT STRUCTURE
================================================================================

elysiaJSXvueJS/
├── package.json              # Root workspace config (npm workspaces)
├── architecture.txt          # This file
├── README.md
│
├── be-elysia/                # BACKEND (Bun + Elysia)
│   ├── package.json
│   ├── tsconfig.json
│   ├── drizzle.config.ts     # Drizzle ORM config
│   ├── .env.example          # Environment variables template
│   └── src/
│       ├── index.ts          # Entry point
│       │
│       ├── domain/           # Layer 1: Core Business Logic
│       │   ├── entities/
│       │   │   └── FileItem.ts       # File/Folder entity
│       │   └── interfaces/
│       │       └── IFileRepository.ts # Contract for file operations
│       │
│       ├── application/      # Layer 2: Use Cases
│       │   └── usecases/
│       │       ├── GetFolderTree.ts    # Get all folders as tree
│       │       ├── GetChildren.ts      # Get direct children
│       │       ├── CreateFolder.ts
│       │       ├── DeleteItem.ts
│       │       └── RenameItem.ts
│       │
│       ├── infrastructure/   # Layer 3: External Implementations
│       │   ├── database/
│       │   │   ├── schema.ts           # Drizzle schema
│       │   │   ├── connection.ts       # MySQL connection
│       │   │   └── seed.ts             # Seed data
│       │   └── repositories/
│       │       └── DatabaseFileRepository.ts  # Implements IFileRepository
│       │
│       └── presentation/     # Layer 4: API Routes
│           └── routes/
│               └── folderRoutes.ts
│
└── fe-vue/                   # FRONTEND (Bun + Vue 3)
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    └── src/
        ├── main.ts
        ├── App.vue
        │
        ├── domain/           # Layer 1: Types & Interfaces
        │   └── entities/
        │       └── Folder.ts         # Folder/File types
        │
        ├── application/      # Layer 2: Business Logic
        │   └── services/
        │       └── FolderService.ts  # Composable for folder operations
        │
        ├── infrastructure/   # Layer 3: API Client
        │   └── api/
        │       └── FolderApi.ts
        │
        └── presentation/     # Layer 4: Vue Components
            └── components/
                ├── FolderTree.vue      # Left panel - recursive tree
                ├── FolderTreeNode.vue  # Single tree node (expandable)
                └── ContentPanel.vue    # Right panel - direct children

================================================================================
                              API ENDPOINTS (REST)
================================================================================

Base URL: http://localhost:3001
Version: v1
Prefix: /api/v1

Method   Endpoint                    Description
------   --------                    -----------
GET      /api/v1/folders/tree        Get ALL folders as nested tree (left panel)
GET      /api/v1/folders/:id/children Get direct children of folder (right panel)
GET      /api/v1/folders/:id         Get single folder details
POST     /api/v1/folders             Create new folder
PATCH    /api/v1/folders/:id         Update folder name
DELETE   /api/v1/folders/:id         Delete folder and all children

================================================================================
                              API CONTRACT
================================================================================

1. GET /api/v1/folders/tree
   Description: Get complete folder tree structure (only folders, no files)
   Use case: Load left panel on initial page load
   
   Request: None
   
   Response 200:
   {
     "success": true,
     "data": [
       {
         "id": 1,
         "name": "Documents",
         "parentId": null,
         "isFolder": true,
         "createdAt": "2025-12-22T13:50:09.000Z",
         "updatedAt": "2025-12-22T13:50:09.000Z",
         "children": [
           {
             "id": 6,
             "name": "Work",
             "parentId": 1,
             "isFolder": true,
             "createdAt": "2025-12-22T13:50:10.000Z",
             "updatedAt": "2025-12-22T13:50:10.000Z",
             "children": []
           }
         ]
       }
     ],
     "error": null
   }

--------------------------------------------------------------------------------

2. GET /api/v1/folders/:id/children
   Description: Get direct children (folders + files) of a specific folder
   Use case: Display right panel content when folder is clicked
   
   Parameters:
     - id: number | "root" (use "root" for root-level items)
   
   Request: None
   
   Response 200:
   {
     "success": true,
     "data": [
       {
         "id": 6,
         "name": "Work",
         "parentId": 1,
         "isFolder": true,
         "createdAt": "2025-12-22T13:50:10.000Z",
         "updatedAt": "2025-12-22T13:50:10.000Z"
       },
       {
         "id": 8,
         "name": "report.txt",
         "parentId": 1,
         "isFolder": false,
         "createdAt": "2025-12-22T13:50:10.000Z",
         "updatedAt": "2025-12-22T13:50:10.000Z"
       }
     ],
     "error": null
   }

--------------------------------------------------------------------------------

3. GET /api/v1/folders/:id
   Description: Get single folder details
   
   Parameters:
     - id: number
   
   Response 200:
   {
     "success": true,
     "data": {
       "id": 1,
       "name": "Documents",
       "parentId": null,
       "isFolder": true,
       "createdAt": "2025-12-22T13:50:09.000Z",
       "updatedAt": "2025-12-22T13:50:09.000Z"
     },
     "error": null
   }
   
   Response 404:
   {
     "success": false,
     "data": null,
     "error": "Folder not found"
   }

--------------------------------------------------------------------------------

4. POST /api/v1/folders
   Description: Create a new folder or file
   
   Request Body:
   {
     "name": "New Folder",
     "parentId": 1,          // null for root level
     "isFolder": true        // optional, defaults to true
   }
   
   Response 200:
   {
     "success": true,
     "data": {
       "id": 20,
       "name": "New Folder",
       "parentId": 1,
       "isFolder": true,
       "createdAt": "2025-12-22T14:00:00.000Z",
       "updatedAt": "2025-12-22T14:00:00.000Z"
     },
     "error": null
   }

--------------------------------------------------------------------------------

5. PATCH /api/v1/folders/:id
   Description: Rename a folder or file
   
   Parameters:
     - id: number
   
   Request Body:
   {
     "name": "Renamed Folder"
   }
   
   Response 200:
   {
     "success": true,
     "data": {
       "id": 1,
       "name": "Renamed Folder",
       "parentId": null,
       "isFolder": true,
       "createdAt": "2025-12-22T13:50:09.000Z",
       "updatedAt": "2025-12-22T14:05:00.000Z"
     },
     "error": null
   }

--------------------------------------------------------------------------------

6. DELETE /api/v1/folders/:id
   Description: Delete a folder and all its children recursively
   
   Parameters:
     - id: number
   
   Response 200:
   {
     "success": true,
     "data": null,
     "error": null
   }

================================================================================
                           DATABASE SCHEMA (MySQL)
================================================================================

TABLE: folders
┌────────────┬──────────────┬─────────────────────────────────────────┐
│ Column     │ Type         │ Description                             │
├────────────┼──────────────┼─────────────────────────────────────────┤
│ id         │ INT (PK)     │ Auto-increment primary key              │
│ name       │ VARCHAR(255) │ Folder/file name                        │
│ parent_id  │ INT (FK)     │ Reference to parent folder (NULL=root)  │
│ is_folder  │ BOOLEAN      │ true=folder, false=file                 │
│ created_at │ TIMESTAMP    │ Creation timestamp                      │
│ updated_at │ TIMESTAMP    │ Last modified timestamp                 │
└────────────┴──────────────┴─────────────────────────────────────────┘

Indexes:
- PRIMARY KEY (id)
- INDEX (parent_id) - for fast children lookup
- INDEX (name) - for search functionality

Tree Algorithm: Adjacency List (parent_id reference)
- Simple and efficient for read-heavy operations
- Easy to query direct children: WHERE parent_id = ?
- Recursive CTE for full tree: WITH RECURSIVE ...

================================================================================
                        DATA STRUCTURE ANALYSIS
================================================================================

WHY ADJACENCY LIST?

We chose the ADJACENCY LIST pattern for hierarchical data storage because it
provides the best balance of simplicity and performance for this use case.

COMPARISON WITH OTHER TREE STRUCTURES:
┌──────────────────────┬──────────────────┬───────────────────┬─────────────┐
│ Structure            │ Insert/Delete    │ Get Subtree       │ Complexity  │
├──────────────────────┼──────────────────┼───────────────────┼─────────────┤
│ Adjacency List ✅    │ O(1)             │ O(n) with Map     │ Simple      │
│ Nested Set           │ O(n) rebalance   │ O(1)              │ Complex     │
│ Materialized Path    │ O(depth)         │ O(n) string match │ Medium      │
│ Closure Table        │ O(depth²)        │ O(1)              │ Extra table │
└──────────────────────┴──────────────────┴───────────────────┴─────────────┘

REQUIREMENT MAPPING:
┌─────────────────────┬─────────────────────────────────────────────────────┐
│ Requirement         │ How Adjacency List Solves It                        │
├─────────────────────┼─────────────────────────────────────────────────────┤
│ Unlimited nesting   │ Just set parent_id to parent's id                   │
│ Easy CRUD           │ Single row insert/update/delete                     │
│ Get direct children │ SELECT * WHERE parent_id = ?                        │
│ Build full tree     │ O(n) algorithm with Map for O(1) lookup             │
│ Simplicity          │ Self-referential foreign key, easy to understand    │
└─────────────────────┴─────────────────────────────────────────────────────┘

TREE BUILDING ALGORITHM (O(n)):
```
/**
 * Time Complexity:  O(n) - Two passes through data
 * Space Complexity: O(n) - Map stores all nodes
 */

// STEP 1: Fetch all folders (Single DB query)
const allFolders = await db.select().from(folders);

// STEP 2: Create Map for O(1) lookup
const folderMap = new Map<number, FolderTreeNode>();
for (const record of allFolders) {
  folderMap.set(record.id, { ...record, children: [] });
}

// STEP 3: Link children to parents
for (const record of allFolders) {
  const node = folderMap.get(record.id);
  if (record.parentId === null) {
    rootFolders.push(node);      // Root level folder
  } else {
    const parent = folderMap.get(record.parentId);
    parent?.children.push(node); // Add as child
  }
}

// STEP 4: Return root folders with nested children
return rootFolders;
```

WHY NOT OTHER STRUCTURES?

1. NESTED SET
   - Requires rebalancing on every insert/delete
   - Complex left/right value management
   - Overkill for this CRUD-heavy application

2. MATERIALIZED PATH
   - Path string can become very long with deep nesting
   - Requires string manipulation for queries
   - Not needed since we don't query by path

3. CLOSURE TABLE
   - Requires additional table for ancestor relationships
   - More storage overhead
   - Useful for ancestry queries (not needed here)

VERDICT: Adjacency List is the BEST FIT for this project because:
- Simple implementation with single self-referential table
- Fast direct children queries (right panel)
- Efficient O(n) tree building algorithm (left panel)
- Easy CRUD operations for folder management
- Well-suited for read-heavy workloads

================================================================================
                           ALGORITHMS USED
================================================================================

This project implements three key algorithms:

┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TREE BUILDING ALGORITHM - O(n)                                           │
│    Location: FolderRepository.getFolderTree()                               │
└─────────────────────────────────────────────────────────────────────────────┘

Purpose: Convert flat database records into nested tree structure

ALGORITHM STEPS:
┌──────┬────────────────────────────────────┬─────────────┐
│ Step │ Operation                          │ Complexity  │
├──────┼────────────────────────────────────┼─────────────┤
│ 1    │ Fetch all folders (single query)   │ O(n)        │
│ 2    │ Create Map for O(1) lookup         │ O(n)        │
│ 3    │ Link children to parents           │ O(n)        │
├──────┼────────────────────────────────────┼─────────────┤
│ TOTAL│                                    │ O(n)        │
└──────┴────────────────────────────────────┴─────────────┘

PSEUDOCODE:
```
function buildTree(records):
    // Pass 1: Create all nodes
    map = new Map()
    for each record in records:
        map.set(record.id, { ...record, children: [] })
    
    // Pass 2: Link parent-child relationships
    roots = []
    for each record in records:
        node = map.get(record.id)
        if record.parentId is null:
            roots.push(node)           // Root folder
        else:
            parent = map.get(record.parentId)
            parent.children.push(node) // Add as child
    
    return roots
```

WHY THIS IS OPTIMAL:
- Single database query (avoids N+1 problem)
- Map provides O(1) parent lookup (vs O(n) array search)
- Two-pass algorithm avoids recursion stack overhead
- Memory efficient: each node stored once

┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. RECURSIVE DELETE ALGORITHM - DFS (Depth-First Search)                    │
│    Location: FolderRepository.deleteRecursive()                             │
└─────────────────────────────────────────────────────────────────────────────┘

Purpose: Delete folder and ALL descendants (children, grandchildren, etc.)

ALGORITHM:
```
function deleteRecursive(id):
    // Get all direct children
    children = SELECT * FROM folders WHERE parent_id = id
    
    // Recursively delete each child first (DFS)
    for each child in children:
        deleteRecursive(child.id)
    
    // Then delete self (after children are gone)
    DELETE FROM folders WHERE id = id
```

VISUALIZATION (DFS order):
```
Delete "Documents" (id=1):
    
    Documents (1)
    ├── Work (2)
    │   ├── report.pdf (4)  ← Delete first (leaf)
    │   └── Projects (5)    ← Delete second (leaf)
    │       └── ...         ← Delete recursively
    └── Personal (3)        ← Delete after Work subtree
        └── ...
    
    Finally delete Documents (1) ← Delete last (root of operation)
```

WHY DFS:
- Must delete children BEFORE parents (foreign key constraint)
- Depth-first ensures leaves deleted first
- Post-order traversal: process children, then self

┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. RECURSIVE COMPONENT RENDERING - Vue Recursion                            │
│    Location: FolderTreeNode.vue                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Purpose: Render unlimited nesting levels in folder tree UI

PATTERN:
```vue
<!-- FolderTreeNode.vue -->
<template>
  <div class="folder-node">
    <!-- Render this node -->
    <div @click="toggle">{{ node.name }}</div>
    
    <!-- Recursively render children -->
    <div v-if="isExpanded">
      <FolderTreeNode           <!-- Component calls itself! -->
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"      <!-- Track depth for indentation -->
      />
    </div>
  </div>
</template>
```

WHY RECURSIVE COMPONENT:
- Handles unlimited nesting naturally
- Each node manages its own expand/collapse state
- Level prop enables proper indentation
- Vue handles component lifecycle automatically

┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. SEARCH ALGORITHM - Pattern Matching                                      │
│    Location: FolderRepository.search()                                      │
└─────────────────────────────────────────────────────────────────────────────┘

Purpose: Find folders/files by name

ALGORITHM:
```sql
SELECT * FROM folders 
WHERE name LIKE '%{query}%'
ORDER BY is_folder DESC, name ASC
LIMIT 50
```

OPTIMIZATIONS:
- Index on `name` column for faster LIKE queries
- Limit results to prevent large payloads
- Sort folders first, then files alphabetically

================================================================================
                        ALGORITHM COMPLEXITY SUMMARY
================================================================================

┌─────────────────────────┬─────────────┬─────────────┬────────────────────┐
│ Algorithm               │ Time        │ Space       │ Location           │
├─────────────────────────┼─────────────┼─────────────┼────────────────────┤
│ Tree Building           │ O(n)        │ O(n)        │ FolderRepository   │
│ Recursive Delete        │ O(n)        │ O(depth)    │ FolderRepository   │
│ Recursive Render        │ O(n)        │ O(depth)    │ FolderTreeNode.vue │
│ Search                  │ O(n)*       │ O(1)        │ FolderRepository   │
└─────────────────────────┴─────────────┴─────────────┴────────────────────┘

* With database index, search is O(log n) for prefix matches

================================================================================
                           DOMAIN ENTITIES
================================================================================

Folder {
    id: number             # Unique identifier
    name: string           # Folder or file name
    parentId: number|null  # Parent folder ID (null = root level)
    isFolder: boolean      # true = folder, false = file
    createdAt: Date        # Creation timestamp
    updatedAt: Date        # Last modified timestamp
    children?: Folder[]    # Nested children (for tree structure)
}

================================================================================
                         LAYER RESPONSIBILITIES
================================================================================

DOMAIN (Core)
- Define entities (Folder)
- Define interfaces/contracts (IFolderRepository)
- NO external dependencies
- Pure TypeScript, no framework code

APPLICATION (Use Cases)
- Orchestrate business logic
- Each use case = one action (GetFolderTree, GetChildren, CreateFolder, etc.)
- Depends only on Domain layer
- Framework agnostic

INFRASTRUCTURE (Adapters)
- Implement domain interfaces
- Database operations via Drizzle ORM
- MySQL connection management
- Handle HTTP client (fetch)

PRESENTATION (UI/API)
- Backend: Elysia routes with validation
- Frontend: Vue 3 components with Composition API
- User interaction handling
- Depends on Application layer

================================================================================
                              FEATURES
================================================================================

MVP Features (Required):
[x] Display folder tree on left panel (all folders on load)
[x] Display direct children on right panel (on folder click)
[x] Expandable/collapsible folders in tree view
[ ] Unlimited folder nesting levels
[ ] Files displayed in right panel

Bonus Features:
[ ] Search function
[ ] Create new folder
[ ] Delete folder
[ ] Rename folder
[ ] Scalable for millions of data

================================================================================
                           TECH DECISIONS
================================================================================

1. Elysia.js - Fast, type-safe backend framework optimized for Bun
2. Bun - Fast JavaScript runtime (preferred over NodeJS)
3. Vue 3 - Composition API for reactive state management
4. TypeScript - Full-stack type safety
5. MySQL - Relational DB for structured folder data
6. Drizzle ORM - Type-safe, lightweight ORM
7. TailwindCSS - Utility-first CSS framework
8. Monorepo - npm workspaces for shared configuration
9. Clean Architecture - Separation of concerns, testability
10. Adjacency List - Simple tree structure for read-heavy workloads

================================================================================
                        BEST PRACTICES IMPLEMENTED
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. ARCHITECTURE BEST PRACTICES                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┬───────────────────────────────────────────────────┐
│ Practice                │ Implementation                                    │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ Clean Architecture      │ 4 layers: Domain → Application → Infra → Present │
│ Separation of Concerns  │ Each layer has single responsibility             │
│ Dependency Inversion    │ Use cases depend on interfaces, not concrete     │
│ Repository Pattern      │ Abstract database access behind interface        │
│ Use Case Pattern        │ Each business action is a separate class         │
└─────────────────────────┴───────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. SOLID PRINCIPLES                                                         │
└─────────────────────────────────────────────────────────────────────────────┘

S - Single Responsibility
    └─ Each use case does ONE thing
       Examples: GetFolderTreeUseCase, CreateFolderUseCase, SearchFoldersUseCase
    └─ Each component has one purpose
       Examples: FolderTree (container), FolderTreeNode (single node)

O - Open/Closed
    └─ Open for extension: Add new repository implementations
    └─ Closed for modification: Interface contracts don't change
    └─ Example: Can swap MySQL for PostgreSQL without changing use cases

L - Liskov Substitution
    └─ Any IFolderRepository implementation can be substituted
    └─ FolderRepository implements IFolderRepository contract exactly
    └─ Use cases work with any valid implementation

I - Interface Segregation
    └─ IFolderRepository has focused, cohesive methods
    └─ No "fat" interfaces with unrelated methods
    └─ Each method serves a specific purpose

D - Dependency Inversion
    └─ High-level modules (Use Cases) don't depend on low-level (Repository)
    └─ Both depend on abstractions (IFolderRepository interface)
    └─ Dependency injection via constructor

┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. CODE QUALITY PRACTICES                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┬───────────────────────────────────────────────────┐
│ Practice                │ Implementation                                    │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ TypeScript Strict       │ Full type safety, no implicit any                 │
│ JSDoc Comments          │ Complex algorithms documented with @param/@returns│
│ Error Handling          │ try/catch with console.error logging              │
│ Input Validation        │ Use cases validate before processing              │
│ Constants File          │ ERROR_MESSAGES, MAX_SEARCH_RESULTS centralized    │
│ Consistent Naming       │ PascalCase classes, camelCase functions           │
│ Small Functions         │ Methods are 5-15 lines, easy to read              │
│ DRY Principle           │ toFolder() mapper reused across repository        │
└─────────────────────────┴───────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. REST API BEST PRACTICES                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┬───────────────────────────────────────────────────┐
│ Practice                │ Implementation                                    │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ API Versioning          │ /api/v1/folders (version in URL)                  │
│ Resource Naming         │ Nouns: /folders, not /getFolder                   │
│ HTTP Methods            │ GET (read), POST (create), PATCH (update), DELETE │
│ Consistent Response     │ { success: boolean, data: T, error: string }      │
│ Proper Status Codes     │ 200 OK, 404 Not Found, etc.                       │
│ Query Parameters        │ /search?q=term for filtering                      │
└─────────────────────────┴───────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. DATABASE BEST PRACTICES                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┬───────────────────────────────────────────────────┐
│ Practice                │ Implementation                                    │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ ORM Usage               │ Drizzle ORM for type-safe queries                 │
│ Indexing                │ parent_id, name columns indexed                   │
│ Timestamps              │ created_at, updated_at on all records             │
│ Foreign Keys            │ Self-referential FK for tree integrity            │
│ Single Query            │ Avoid N+1 problem in tree building                │
│ Connection Pooling      │ MySQL pool for concurrent requests                │
└─────────────────────────┴───────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. FRONTEND BEST PRACTICES                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┬───────────────────────────────────────────────────┐
│ Practice                │ Implementation                                    │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ Composition API         │ ref(), computed(), composables                    │
│ Component Reusability   │ Recursive FolderTreeNode for any depth            │
│ Service Layer           │ useFolderService composable for state             │
│ Reactive Updates        │ Vue reactivity for automatic UI sync              │
│ Props Down, Events Up   │ @select event bubbles folder selection            │
│ Computed Properties     │ hasChildren, isSelected derived from state        │
└─────────────────────────┴───────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 7. PROJECT STRUCTURE BEST PRACTICES                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┬───────────────────────────────────────────────────┐
│ Practice                │ Implementation                                    │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ Monorepo                │ npm workspaces for BE + FE                        │
│ Layer Folders           │ domain/, application/, infrastructure/, present.  │
│ Feature Organization    │ Files grouped by feature, not type                │
│ Index Exports           │ usecases/index.ts for clean imports               │
│ Environment Config      │ .env for secrets, not hardcoded                   │
└─────────────────────────┴───────────────────────────────────────────────────┘

================================================================================
                           SCALABILITY STRATEGY
================================================================================

Target: Millions of folders with thousands of concurrent users

┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. DATABASE OPTIMIZATION                                                    │
└─────────────────────────────────────────────────────────────────────────────┘

INDEXES IMPLEMENTED:
┌─────────────────────────┬───────────────────────────────────────────────────┐
│ Index                   │ Purpose                                           │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ PRIMARY KEY (id)        │ Fast single record lookup                         │
│ INDEX (parent_id)       │ Fast children query: O(log n) vs O(n)             │
│ INDEX (name)            │ Fast search queries with LIKE                     │
└─────────────────────────┴───────────────────────────────────────────────────┘

QUERY OPTIMIZATION:
- Single query for tree building (no N+1 problem)
- LIMIT clause on search results (max 50)
- ORDER BY uses indexed columns

┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. ALGORITHM EFFICIENCY                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

CURRENT IMPLEMENTATION:
┌─────────────────────────┬─────────────┬─────────────────────────────────────┐
│ Operation               │ Complexity  │ Why Efficient                       │
├─────────────────────────┼─────────────┼─────────────────────────────────────┤
│ Build tree              │ O(n)        │ Map for O(1) parent lookup          │
│ Get children            │ O(log n)    │ Indexed parent_id query             │
│ Search                  │ O(log n)    │ Indexed name column                 │
│ Insert/Update/Delete    │ O(1)        │ Single row operations               │
└─────────────────────────┴─────────────┴─────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. LAZY LOADING (OPTIONAL - DOCUMENTED)                                     │
└─────────────────────────────────────────────────────────────────────────────┘

For very large datasets, lazy loading can be enabled:
- See: lazyloading.txt for implementation guide
- Load only root folders initially
- Fetch children on-demand when user expands folder
- Reduces initial payload from O(n) to O(root folders)

API Support:
- GET /api/v1/folders/subfolders/:id  (fetch children on expand)

┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. CONNECTION POOLING                                                       │
└─────────────────────────────────────────────────────────────────────────────┘

MySQL Connection Pool:
- Default: 10 connections
- Reuses connections (no connect/disconnect overhead)
- Handles concurrent requests efficiently
- Configurable via DATABASE_URL

┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. FUTURE SCALABILITY OPTIONS                                               │
└─────────────────────────────────────────────────────────────────────────────┘

For further scaling (not implemented, but architecture supports):

CACHING:
┌─────────────────────────┬───────────────────────────────────────────────────┐
│ Strategy                │ Benefit                                           │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ Redis cache             │ Sub-millisecond tree retrieval                    │
│ Cache invalidation      │ Invalidate on folder mutations                    │
│ CDN for static assets   │ Reduce server load                                │
└─────────────────────────┴───────────────────────────────────────────────────┘

HORIZONTAL SCALING:
┌─────────────────────────┬───────────────────────────────────────────────────┐
│ Strategy                │ Benefit                                           │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ Load balancer           │ Distribute requests across servers                │
│ Read replicas           │ Scale read-heavy operations                       │
│ Microservices           │ Independent scaling of components                 │
└─────────────────────────┴───────────────────────────────────────────────────┘

PAGINATION:
- Implement cursor-based pagination for large folders
- Virtual scrolling in frontend for 1000+ items

┌─────────────────────────────────────────────────────────────────────────────┐
│ SCALABILITY SUMMARY                                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┬───────────────┬───────────────────────────────────┐
│ Feature                 │ Status        │ Impact                            │
├─────────────────────────┼───────────────┼───────────────────────────────────┤
│ Database indexes        │ ✅ Implemented│ 10-100x faster queries            │
│ O(n) algorithm          │ ✅ Implemented│ Linear time tree building         │
│ Connection pooling      │ ✅ Implemented│ Handle concurrent users           │
│ Lazy loading guide      │ ✅ Documented │ Reduce initial load               │
│ Search limit            │ ✅ Implemented│ Prevent large payloads            │
│ Caching layer           │ 📋 Ready      │ Architecture supports Redis       │
│ Horizontal scaling      │ 📋 Ready      │ Stateless API design              │
└─────────────────────────┴───────────────┴───────────────────────────────────┘

================================================================================
