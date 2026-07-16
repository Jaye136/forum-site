import { userCheck } from "./data";

let currUser;

// check if password matches the user id, if true, allow login
export function loginUser(id, pass) {
    let userResult = userCheck(id);
    if (userResult) {
        if (userResult.password == pass) {
            currUser = userResult;
            // successful login, refresh page
        }
    } else {
        // tell user there is no user by that id
    }
}

// check if user has permission to view ids of users
export function canSeeIdentity() {
    if (currUser === undefined) return false;
    if (currUser.role == 'member') return false;
    return true;
}

// check if user has permission to view promotion/demotion function
export function canProDemote() {
    if (currUser === undefined) return false;
    if (currUser.role == 'member') return false;
    return true;
}

// check if user can delete comment
export function canDelCom(comment) {
    if (currUser === undefined) return false;
    if (currUser.role == 'mod') return true;
    if (currUser.id == comment.author) return true;
    return false;
}

// check if user can delete post
export function canDelCom(post) {
    if (currUser === undefined) return false;
    if (currUser.role == 'mod') return true;
    if (currUser.id == post.author) return true;
    return false;
}