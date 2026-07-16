import { connectStream, loadUsers } from "./data";

async function startServer() {
    await loadUsers();
    connectStream();
}

startServer();