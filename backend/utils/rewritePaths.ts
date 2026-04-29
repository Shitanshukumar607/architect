import fs from "fs";
import path from "path";

export function rewriteHtmlPaths(outputDir: string, deploymentId: string) {
  const basePath = `/deployments/${deploymentId}/`;

  // Helper to recursively get all files
  function getAllFiles(dir: string, fileList: string[] = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  const allFiles = getAllFiles(outputDir);
  const assetPaths = allFiles.map((file) => {
    // Get relative path, e.g., 'assets/react.svg' or 'icons.svg'
    const relative = path.relative(outputDir, file).replace(/\\/g, "/");
    return `/${relative}`; // e.g., '/assets/react.svg'
  });

  // We only want to process HTML, JS, and CSS files
  const processableFiles = allFiles.filter((file) =>
    /\.(html|js|mjs|cjs|css)$/.test(file)
  );

  for (const file of processableFiles) {
    let content = fs.readFileSync(file, "utf-8");
    let modified = false;

    // Inject base tag for HTML files
    if (file.endsWith("index.html")) {
      if (!content.includes(`<base href="${basePath}">`)) {
        content = content.replace(
          /<head>/i,
          `<head>\n    <base href="${basePath}">`
        );
        modified = true;
      }
      
      // Handle src="/..." and href="/..." fallback for HTML specifically
      const srcHrefRegex = /(src|href)=["']\/(?!\/)([^"']+)["']/g;
      content = content.replace(srcHrefRegex, (match, attr, matchedPath) => {
        modified = true;
        return `${attr}="${basePath}${matchedPath}"`;
      });
    }

    // Replace all known absolute asset paths in JS/CSS/HTML
    for (const assetPath of assetPaths) {
      if (assetPath === "/index.html") continue; // Skip rewriting the root HTML path itself

      // Escape the asset path for regex, e.g. "/assets/react\.svg"
      const escapedAssetPath = assetPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // Match exact string literals or url(...) usages
      // Examples: "/assets/react.svg", '/assets/react.svg', url(/assets/react.svg), url("/assets/react.svg")
      const regex = new RegExp(
        `(["'\\\`]|url\\(\\s*["']?)${escapedAssetPath}(["'\\\`]?\\s*\\))`,
        "g"
      );

      const newContent = content.replace(regex, (match, p1, p2) => {
        modified = true;
        return `${p1}${basePath}${assetPath.substring(1)}${p2}`;
      });
      content = newContent;
    }

    // Extra safety for dynamic imports that might just use "/assets/"
    const assetsPrefixRegex = /(["'\\\`])\/assets\//g;
    if (assetsPrefixRegex.test(content)) {
      content = content.replace(assetsPrefixRegex, (match, quote) => {
         modified = true;
         return `${quote}${basePath}assets/`;
      });
    }

    if (modified) {
      fs.writeFileSync(file, content, "utf-8");
    }
  }

  console.log(`[Worker] Rewrote absolute paths for deployment ${deploymentId}`);
}
