import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve("./src");

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Match imports like "./something" or "../something"
  const regex = /(from\s+["'])(\..+?)(["'];?)/g;

  content = content.replace(regex, (match, p1, p2, p3) => {
    // Skip if already ends with .js or .json
    if (p2.endsWith(".js") || p2.endsWith(".json")) {
      return match;
    }
    return `${p1}${p2}.js${p3}`;
  });

  fs.writeFileSync(filePath, content, "utf8");
}

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith(".ts")) {
      fixFile(fullPath);
      console.log(`✅ Fixed imports in ${fullPath}`);
    }
  }
}

walk(SRC_DIR);
