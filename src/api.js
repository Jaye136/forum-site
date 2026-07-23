import express from "express";
import { loadAllComments, loadPost, refreshPosts } from "./data.js";
import { loadSchema, testStuff } from "./database.js";
const app = express();
const port = 3000; // high number = lower access

app.set("view engine", "ejs");

await loadSchema();
await testStuff();

app.get('/posts', async (req, res) => {
    const postList = await refreshPosts();
    res.render("fpage.ejs", { postList }
    );
});

app.get('/posts/:id', async (req, res) => {
    const id = req.params.id;
    const loadResult = await loadPost(id);

    if (loadResult.length == 0) {
        return res.status(404).render("post404.ejs");
    }
    
    const post = loadResult[0];
    const commentChunks = await loadAllComments(post);
    res.render("post.ejs", { post, commentChunks });
});

app.get("/", (req, res) => {
    res.send("<h1>Hello World!</h1>");
});

app.use(express.static("public"));

// start listening for http requests
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});