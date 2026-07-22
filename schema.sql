CREATE TABLE if NOT EXISTS users (
	username VARCHAR(12) NOT NULL,
    password VARCHAR(12) NOT NULL,
    id CHAR(8) PRIMARY KEY,
    role VARCHAR(6) NOT NULL
);

CREATE TABLE if NOT EXISTS comments (
	contents VARCHAR(500) NOT NULL,
    author CHAR(10) NOT NULL,
    timestamp DATETIME NOT NULL,
    status VARCHAR(7) NOT NULL,
    id CHAR(9) PRIMARY KEY,
    parent CHAR(10) NOT NULL
);

CREATE TABLE if NOT EXISTS posts (
    title VARCHAR(200) NOT NULL,
	contents VARCHAR(1000) NOT NULL,
    author CHAR(10) NOT NULL,
    timestamp DATETIME NOT NULL,
    id CHAR(8) PRIMARY KEY,
    status VARCHAR(7) NOT NULL
);



DROP PROCEDURE IF EXISTS registerUser;
DROP PROCEDURE IF EXISTS fetchUser;
DROP PROCEDURE IF EXISTS promoteUser;
DROP PROCEDURE IF EXISTS demoteUser;

CREATE PROCEDURE registerUser
(
	IN user VARCHAR(12),
    IN pass VARCHAR(12),
    IN uuid CHAR(8),
    IN perms VARCHAR(6)
)
BEGIN
	INSERT INTO users (username, password, id, role)
	VALUES (user, pass, uuid, perms);
END;

CREATE PROCEDURE fetchUser
(
	IN uuid VARCHAR(12)
)
BEGIN
	SELECT * FROM users WHERE id = uuid;
END;

CREATE PROCEDURE promoteUser
(
	IN uuid CHAR(10)
)
BEGIN
	UPDATE users SET role = 'mod' WHERE id = uuid;
END;

CREATE PROCEDURE demoteUser
(
	IN uuid CHAR(10)
)
BEGIN
	UPDATE users SET role = 'member' WHERE id = uuid;
END;



DROP PROCEDURE IF EXISTS addComment;
DROP PROCEDURE IF EXISTS fetchTopComments;
DROP PROCEDURE IF EXISTS fetchNestedComments;

CREATE PROCEDURE addComment
(
	IN cont VARCHAR(500),
    IN poster CHAR(10),
    IN time DATETIME,
    IN delstat VARCHAR(7),
    IN uuid CHAR(9),
    IN rep2what CHAR(11)
)
BEGIN
	INSERT INTO posts (contents, author, timestamp, id, status)
	VALUES (cont, poster, time, delstat, uuid, rep2what);
END;

CREATE PROCEDURE fetchTopComments
(
	IN postid CHAR(10)
)
BEGIN
	SELECT * FROM comments WHERE parent = postid ORDER BY timestamp DESC LIMIT 25;
END;

CREATE PROCEDURE fetchNestedComments
(
	IN commentid CHAR(10)
)
BEGIN
	SELECT * FROM comments WHERE parent = commentid ORDER BY timestamp DESC LIMIT 25;
END;



DROP PROCEDURE IF EXISTS addPost;
DROP PROCEDURE IF EXISTS fetchPost;
DROP PROCEDURE IF EXISTS fetchPosts;

CREATE PROCEDURE addPost
(
    IN head VARCHAR(200),
	IN cont VARCHAR(1000),
    IN poster CHAR(10),
    IN time DATETIME,
    IN uuid CHAR(8),
    IN delstat VARCHAR(7)
)
BEGIN
	INSERT INTO posts (title, contents, author, timestamp, id, status)
	VALUES (head, cont, poster, time, uuid, delstat);
END;

CREATE PROCEDURE fetchPost
(
	IN uuid VARCHAR(12)
)
BEGIN
	SELECT * FROM posts WHERE id = uuid;
END;

CREATE PROCEDURE fetchPosts
(
	IN fetchReqAmount INT
)
BEGIN
	SELECT * FROM posts ORDER BY timestamp DESC LIMIT fetchReqAmount;
END;



