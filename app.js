import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToMongoDB, hashPassword } from "./src/utils/features.js";
import userRoute from "./src/routes/admin.js";
import postsRoute from "./src/routes/post.js";
import sponsorsRoute from "./src/routes/sponsor.js";
// import ImageKit from "imagekit";
import morgan from "morgan";
import NodeCache from "node-cache";
import axios from "axios";
// const path = require("path");
// const fs = require("fs");
import fs from "fs";
import path from "path";

dotenv.config({ path: "./.env" });

const app = express();

const PORT = process.env.PORT;
export let AdminPassKey;

export const jwtSecret = process.env.JWT_SECRET;
export const TTL = process.env.TIME_TO_LIVE;
export const envMode = process.env.NODE_ENV || "PRODUCTION";
const mongoUri = process.env.MONGO_URI;
export const myCache = new NodeCache();

console.log("CLIENT_URL:", process.env.CLIENT_URL);

// Setup CORS
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://news-app-cyan-ten.vercel.app",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

// Basic Route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Initialize ImageKit
// export const imagekit = new ImageKit({
//     publicKey: process.env.PUBLIC_KEY,
//     privateKey: process.env.PRIVATE_KEY,
//     urlEndpoint: process.env.URL_ENDPOINT,
// });

// 🔹 Open Graph Meta Route for Social Sharing
// app.get("/viewfull/:id", async (req, res) => {
//   try {
//     const id = "6836ee28071f223f25d6331c";
//     // const { id } = req.params;

//     const apiResponse = await axios.get(
//       `${"https://moody-taxes-beg.loca.lt"}/api/v1/posts/${"6836ee28071f223f25d6331c"}`
//       //   {
//       //     headers: {
//       //       "ngrok-skip-browser-warning": "true",
//       //     },
//       //   }
//     );

//     if (!apiResponse.data.success) {
//       return res.status(404).send("Article not found");
//     }

//     const post = apiResponse?.data?.post;

//     // Fallbacks + escape to avoid HTML breakage
//     const title = escapeHTML(post?.title || "Untitled Post");
//     const description = escapeHTML(
//       post.description || "Read this article on Dehaat News."
//     );
//     const imageUrl =
//       post.imageUrl ||
//       post.photos?.[0]?.url ||
//       "https://news-app-cyan-ten.vercel.app/dehaatnews.png"; // your fallback image

//     const ogMetaTags = `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>${title} - Dehaat News</title>

//             <!-- Open Graph Tags -->
//             <meta property="og:title" content="${title}" />
//             <meta property="og:description" content="${description}" />
//             <meta property="og:image" content="${imageUrl}" />
//             <meta property="og:image:secure_url" content="${imageUrl}" />
//             <meta property="og:image:width" content="1200" />
//             <meta property="og:image:height" content="630" />
//             <meta property="og:type" content="article" />
//             <meta property="og:url" content="https://news-app-cyan-ten.vercel.app/viewfull/${id}" />

//             <!-- Twitter -->
//             <meta name="twitter:card" content="summary_large_image" />
//             <meta name="twitter:title" content="${title}" />
//             <meta name="twitter:description" content="${description}" />
//             <meta name="twitter:image" content="${imageUrl}" />

//             <!-- Redirect to frontend after preview -->
//             <script>
//                 window.location.href = "https://news-app-cyan-ten.vercel.app/news/${id}";
//             </script>
//         </head>
//         <body></body>
//         </html>
//         `;

//     res.send(ogMetaTags);
//   } catch (error) {
//     console.error("Error in /viewfull/:id:", error.message);
//     res.status(500).send("Server Error");
//   }
// });

app.get("/viewfull/:id", async (req, res) => {
  try {
    // const { id } = req.params;

    const { id } = req.params; // ✅ This line is missing in your code
    // ✅ Use your backend API, not CLIENT_URL
    const apiResponse = await axios.get(
      `${"https://news-app-backend-production.up.railway.app"}/api/v1/posts/${"6836ee28071f223f25d6331c"}`
    );

    console.log({ apiResponse });

    if (!apiResponse.data.success) {
      return res.status(404).send("Post not found");
    }

    const post = apiResponse?.data?.post;
    const title = escapeHTML(post?.title || "Untitled Post");
    const description = escapeHTML(
      post?.description || "Read this article on Dehaat News."
    );
    const rawImageUrl =
      post.imageUrl ||
      post.photos?.[0]?.url ||
      "https://news-app-cyan-ten.vercel.app/dehaatnews.png";
    const imageUrl = escapeHTML(rawImageUrl);
    const pageUrl = `https://news-app-cyan-ten.vercel.app/viewfull/${id}`;

    // const indexPath = path.join(process.cwd(), "dist", "index.html");
    // fs.readFile(indexPath, "utf8", (err, htmlData) => {
    //   if (err) {
    //     console.error("Error reading index.html:", err);
    //     return res.status(500).send("Internal Server Error");
    //   }

    //   // ✅ Replace placeholders
    //   let modifiedHtml = htmlData
    //     .replace(/__META_TITLE__/g, title)
    //     .replace(/__META_DESCRIPTION__/g, description)
    //     .replace(/__META_IMAGE__/g, imageUrl)
    //     .replace(/__META_URL__/g, pageUrl);

    //   // ✅ Optional: Redirect to full article after showing preview
    //   modifiedHtml = modifiedHtml.replace(
    //     "</head>",
    //     `<meta http-equiv="refresh" content="2;url=https://news-app-cyan-ten.vercel.app/news/${id}" />\n</head>`
    //   );

    //   res.send(modifiedHtml);
    // });

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta name="description" content="${description}" />
        <meta property="og:image" content="${imageUrl}" />
        <!-- other meta tags -->
      </head>
      <body>
        <div id="root"></div>
        <script>
          window.__PRELOADED_STATE__ = ${JSON.stringify(post)};
        </script>
        <script src="/static/js/main.js"></script>
           <script>
                window.location.href = "${pageUrl}";
            </script>
      </body>
    </html>
  `;

    res.send(html);
  } catch (error) {
    console.error("Error in /viewfull/:id:", error.message);
    res.status(500).send("Server Error");
  }
});

// Escape HTML for safe meta output
function escapeHTML(str) {
  return str
    ?.replace(/&/g, "&amp;")
    ?.replace(/</g, "&lt;")
    ?.replace(/>/g, "&gt;")
    ?.replace(/"/g, "&quot;")
    ?.replace(/'/g, "&#039;");
}

// Initialize MongoDB and Start Server
const initializeServer = async () => {
  try {
    AdminPassKey = await hashPassword(process.env.ADMIN_PASS_KEY);

    await connectToMongoDB(mongoUri);

    app.use("/api/v1/user", userRoute);
    app.use("/api/v1/posts", postsRoute);
    app.use("/api/v1/sponsors", sponsorsRoute);

    app.listen(PORT, () => {
      console.log(`🚀 App is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error initializing server:", error);
  }
};

initializeServer();
