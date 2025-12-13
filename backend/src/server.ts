import "dotenv/config";
import { createApp } from "@/app";
import { DB } from "@/config/db";

async function initApp() {
  try {
    // Connect to the database
    await DB.getClient().$connect();

    // Create the Express application
    const app = createApp();
    const port = process.env.PORT || 4000;

    // Start the server
    app.listen(port, () => {
      console.log("Server is running on port", port);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

// Start the application
void initApp();
