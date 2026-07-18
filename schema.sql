CREATE DATABASE forum_db;
USE forum_db;

CREATE TABLE users (
	username VARCHAR(12) NOT NULL,
    password VARCHAR(12) NOT NULL,
    id CHAR(10) PRIMARY KEY,
    role VARCHAR(6) NOT NULL
);

CREATE TABLE comments (
	contents TEXT(500) NOT NULL,
    author CHAR(10) NOT NULL,
    timestamp DATETIME NOT NULL,
    status VARCHAR(7) NOT NULL,
    id CHAR(10) PRIMARY KEY,
    parent CHAR(10) NOT NULL
);

CREATE TABLE posts (
	contents TEXT(1000) NOT NULL,
    author CHAR(10) NOT NULL,
    timestamp DATETIME NOT NULL,
    id CHAR(10) PRIMARY KEY,
    status VARCHAR(7) NOT NULL
);


delimiter //
CREATE PROCEDURE registerUser
(
	IN user VARCHAR(12),
    IN pass VARCHAR(12),
    IN uuid CHAR(10),
    IN perms VARCHAR(6)
)
BEGIN
	INSERT INTO users (username, password, id, role)
	VALUES (user, pass, uuid, perms);
END //

CREATE PROCEDURE fetchUser
(
	IN uuid VARCHAR(12),
)
BEGIN
	SELECT * FROM users WHERE id = uuid;
END //

CREATE PROCEDURE promoteUser
(
	IN uuid CHAR(10)
)
BEGIN
	UPDATE users SET role = 'mod' WHERE id = uuid;
END //

CREATE PROCEDURE demoteUser
(
	IN uuid CHAR(10)
)
BEGIN
	UPDATE users SET role = 'member' WHERE id = uuid;
END //


CREATE PROCEDURE fetchTopComments
(
	postid CHAR(10)
)
BEGIN
	SELECT * FROM comments WHERE parent = postid ORDER BY timestamp DESC LIMIT 25;
END //

CREATE PROCEDURE fetchNestedComments
(
	commentid CHAR(10)
)
BEGIN
	SELECT * FROM comments WHERE parent = commentid ORDER BY timestamp DESC LIMIT 25;
END //


CREATE PROCEDURE fetchPosts
(
	fetchReqAmount INT(0)
)
BEGIN
	SELECT * FROM posts ORDER BY timestamp DESC LIMIT fetchReqAmount;
END;

delimiter;




