const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const lockFile = path.join(__dirname, ".watcher-lock");

if (fs.existsSync(lockFile)) {
    console.log("Watcher already running. Exiting...");
    process.exit(0);
}

// create lock file
fs.writeFileSync(lockFile, "watcher running");

console.log("Starting esbuild watcher...");

async function runWatcher() {
    const ctx = await esbuild.context({
        entryPoints: ["main.js"],
        bundle: true,
        outfile: "bundle.js",
        minify: false,
        sourcemap: true,
        loader: {
            ".geojson": "json",
            ".json": "json"

        },
        platform: "browser",
        target: ["esnext"],
        format: "iife"
    });

    await ctx.watch(); // this starts watching for changes
    console.log("Initial build complete! Watching for changes...");
}

runWatcher().catch((err) => {
    console.error("Build failed:", err);
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
    process.exit(1);
});

// cleanup lock on exit
process.on("exit", () => fs.existsSync(lockFile) && fs.unlinkSync(lockFile));
process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());