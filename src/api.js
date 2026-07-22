// import { connectStream, loadUsers } from "./data";

// async function startServer() {
//     await loadUsers();
//     connectStream();
// }

// startServer();

import express from "express";
import { loadPost, loadPosts, refreshPosts } from "./data.js";
import { loadSchema } from "./database.js";
const app = express();
const port = 3000; // high number = lower access

app.set("view engine", "ejs");

await loadSchema();

app.get('/posts', async (req, res) => {
    const postList = await refreshPosts();
    res.render("fpage.ejs", {postList}
    );
});

app.get('/posts/:id', async (req, res) => {
    const id = req.params.id;
    const post = await loadPost(id);
    res.render("post.ejs", {post});
});

app.get("/", (req, res) => {
    res.send("<h1>Hello World!</h1>");
});

app.use(express.static("public"));

// start listening for http requests
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});