import { eq } from "drizzle-orm";
import { db, pool } from "./connection";
import { folders } from "./schema";

const fileExtensions = ["txt", "pdf", "doc", "docx", "xls", "xlsx", "jpg", "png", "mp3", "mp4", "zip", "json", "xml", "csv", "html"];
const folderNames = ["Projects", "Reports", "Archive", "Backup", "Templates", "Resources", "Assets", "Data", "Config", "Logs"];
const fileNames = ["report", "document", "notes", "data", "summary", "analysis", "presentation", "draft", "final", "backup"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFileName(): string {
  const name = randomItem(fileNames);
  const ext = randomItem(fileExtensions);
  const num = Math.floor(Math.random() * 100);
  return `${name}_${num}.${ext}`;
}

async function seed() {
  console.log("🌱 Seeding database with 1000+ rows...");

  await db.delete(folders);

  const rootFolders = [
    { name: "Documents", isFolder: true },
    { name: "Downloads", isFolder: true },
    { name: "Pictures", isFolder: true },
    { name: "Music", isFolder: true },
    { name: "Videos", isFolder: true },
    { name: "Desktop", isFolder: true },
    { name: "Projects", isFolder: true },
  ];

  for (const folder of rootFolders) {
    await db.insert(folders).values(folder);
  }

  const allRootFolders = await db.select().from(folders);
  let totalRows = allRootFolders.length;

  for (const rootFolder of allRootFolders) {
    const subFolderCount = 7 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < subFolderCount; i++) {
      const subFolderName = `${randomItem(folderNames)}_${i + 1}`;
      const result = await db.insert(folders).values({
        name: subFolderName,
        parentId: rootFolder.id,
        isFolder: true,
      });
      totalRows++;

      const subFolderId = result[0].insertId;

      const nestedFolderCount = 2;
      for (let j = 0; j < nestedFolderCount; j++) {
        const nestedResult = await db.insert(folders).values({
          name: `${randomItem(folderNames)}_${j + 1}`,
          parentId: subFolderId,
          isFolder: true,
        });
        totalRows++;

        const nestedFolderId = nestedResult[0].insertId;
        const deepFileCount = 5 + Math.floor(Math.random() * 2);
        for (let k = 0; k < deepFileCount; k++) {
          await db.insert(folders).values({
            name: generateFileName(),
            parentId: nestedFolderId,
            isFolder: false,
          });
          totalRows++;
        }
      }

      const fileCount = 6 + Math.floor(Math.random() * 2);
      for (let j = 0; j < fileCount; j++) {
        await db.insert(folders).values({
          name: generateFileName(),
          parentId: subFolderId,
          isFolder: false,
        });
        totalRows++;
      }
    }

    const rootFileCount = 4 + Math.floor(Math.random() * 2);
    for (let i = 0; i < rootFileCount; i++) {
      await db.insert(folders).values({
        name: generateFileName(),
        parentId: rootFolder.id,
        isFolder: false,
      });
      totalRows++;
    }
  }

  console.log(`✅ Database seeded successfully with ${totalRows} rows!`);
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
