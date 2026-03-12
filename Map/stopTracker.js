const fs = require("fs");
const path = require("path");

const lockFile = path.join(__dirname, ".watcher-lock");

if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
    console.log("Watcher lock removed. You can now restart the watcher.");
} else {
    console.log("No watcher lock found. Nothing to stop.");
}