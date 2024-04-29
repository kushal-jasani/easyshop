const db = require("../util/database");

const createPost = async (user_id, description, title) => {
  return await db.query(
    "INSERT INTO posts (user_id, description, title) VALUES (?, ?, ?)",
    [user_id, description, title]
  );
};

const insertHashtags = async (hashtag, user_id, post_id) => {
  return await db.query(
    "INSERT INTO hashtag (tag, user_id, post_id) VALUES (?, ?, ?)",
    [hashtag, user_id, post_id]
  );
};

const insertImages = async (post_id, url) => {
  return await db.query("INSERT INTO images (post_id, image, type) VALUES (?, ?, ?)", [
    post_id,
    url,
    url.endsWith(".mp4") ? 2 : 1,
  ]);
};

const addLikeToPost = async (userId, postId) => {
  return await db.query("INSERT INTO likes set ?", {
    user_id: userId,
    post_id: postId,
  });
};

const removeLikeFromPost = async (userId, postId) => {
  return await db.query("DELETE FROM likes WHERE post_id = ? AND user_id = ?", [
    postId,
    userId,
  ]);
};

const addCommentToPost = async (comment, userId, postId) => {
  return await db.query("INSERT INTO comments set ?", {
    comment: comment,
    user_id: userId,
    post_id: postId,
  });
};

const removeCommentFromPost = async (commentId, userId) => {
 return await db.query("DELETE FROM comments WHERE id = ? AND user_id = ?", [
    commentId,
    userId,
  ]);
};

const getCommentCountForPost=async(postId)=>{
  return await db.query('SELECT COUNT(*) AS commentCount FROM comments WHERE post_id = ?',[postId]);
}

const fetchPost = async () => {
  const sql = `SELECT 
  p.id AS post_id,
  CASE
      WHEN u.role = 1 THEN u.firstname
      WHEN u.role = 2 THEN b.b_name
  END AS user_name,
  p.title,
  p.description,
  p.created_at,
  (
    SELECT JSON_ARRAYAGG(JSON_OBJECT('url', i.image, 'type', i.type))
    FROM (
        SELECT i.image, i.type
        FROM images i
        WHERE p.id = i.post_id
    ) AS i
) AS post,
  COUNT(DISTINCT l.id) AS total_likes,
  COUNT(DISTINCT c.id) AS total_comments
FROM 
  posts p
JOIN 
  users u ON p.user_id = u.id
LEFT JOIN 
  business b ON u.role = 2 AND u.id = b.userid
LEFT JOIN 
  likes l ON p.id = l.post_id
LEFT JOIN 
  comments c ON p.id = c.post_id
`;
  return await db.query(sql);
};

const fetchComments = async (postId) => {
  const query = ` SELECT 
  c.id AS comment_id,
  c.comment,
  c.created_at,
  CASE
      WHEN u.role = 1 THEN u.firstname
      WHEN u.role = 2 THEN b.b_name
  END AS user_name
FROM 
  comments c
JOIN 
  users u ON c.user_id = u.id
LEFT JOIN 
  business b ON u.role = 2 AND u.id = b.userid
WHERE 
  c.post_id = ?;`;
  return await db.query(query, [postId]);
};

const fetchSingleComment = async (commentId,postId,userId) => {
  const query = `SELECT 
  c.id AS comment_id,
  c.comment,
  c.created_at,
  CASE
      WHEN u.role = 1 THEN u.firstname
      WHEN u.role = 2 THEN b.b_name
  END AS user_name
FROM 
  comments c
JOIN 
  users u ON c.user_id = u.id
LEFT JOIN 
  business b ON u.role = 2 AND u.id = b.userid
WHERE 
  c.id=? AND c.post_id = ? AND c.user_id=?;`;
  return await db.query(query,[commentId,postId,userId]);
};


const checkIfUserLikedPost = async (userId, postId) => {
  return await db.query("SELECT * from likes WHERE user_id=? AND post_id=?", [
    userId,
    postId,
  ]);
};

const getFollowersOfUser = async (userId) => {
  const sql = "SELECT follower_id FROM followers WHERE user_id = ?";
  return await db.query(sql, [userId]);
};

const getUserIdFromPostId = async (postId) => {
  const sql = "SELECT user_id FROM posts WHERE id = ?";
  return await db.query(sql, [postId]);
};

const getLikeCountForPost = async (postId) => {
  return await db.query(
    "SELECT COUNT(*) AS likeCount FROM likes WHERE post_id = ?",
    [postId]
  );
};

const getTotalFollowersCount=async(userId)=>{
  return await db.query(`SELECT COUNT(*) AS totalFollowers
  FROM followers
  WHERE user_id = ?;
  `,[userId])
}

const getTotalFollowingCount=async(userId)=>{
  return await db.query(`SELECT COUNT(*) AS totalFollowings
  FROM followers
  WHERE follower_id = ?;
  `,[userId])
}

const getTotalPostCount=async(userId)=>{
  return await db.query(`SELECT COUNT(*) AS totalPosts
  FROM posts
  WHERE user_id = ?;
  `,[userId])
}

module.exports = {
  createPost,
  insertHashtags,
  insertImages,
  addLikeToPost,
  removeLikeFromPost,
  fetchPost,
  addCommentToPost,
  removeCommentFromPost,
  fetchComments,
  fetchSingleComment,
  checkIfUserLikedPost,
  getFollowersOfUser,
  getUserIdFromPostId,
  getLikeCountForPost,
  getCommentCountForPost,
  getTotalFollowersCount,
  getTotalFollowingCount,
  getTotalPostCount
};
