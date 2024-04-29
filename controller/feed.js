const { generateResponse, sendHttpResponse } = require("../helper/response");
const {
  createPost,
  insertHashtags,
  insertImages,
  addLikeToPost,
  removeLikeFromPost,
  fetchPost,
  addCommentToPost,
  removeCommentFromPost,
  fetchComments,
  checkIfUserLikedPost,
  getFollowersOfUser,
  getUserIdFromPostId,
  getLikeCountForPost,
  getCommentCountForPost,
  fetchSingleComment,
  getTotalFollowersCount,
  getTotalFollowingCount,
  getTotalPostCount,
} = require("../repository/feed");
const { uploader } = require("../uploads/uploader");
const { getWebSocketServer } = require("../util/websocket");

exports.addPost = async (req, res, next) => {
  try {
    const { description, title, hashtags } = req.body;
    const user_id = req.user.userId;
    const files = req.files.posts;
    const [postResult] = await createPost(user_id, title, description);
    const post_id = postResult.insertId;

    var hashtagsArray = JSON.parse(hashtags);

    await Promise.all(
      hashtagsArray.map(async (hashtag) => {
        await insertHashtags(hashtag, user_id, post_id);
      })
    );

    const cloudinaryUrls = await uploader(
      `easyshop/User_${user_id}/Posts/Post_${post_id}`,
      ...files
    );
    if (!cloudinaryUrls.every((url) => url)) {
      throw new Error("Failed to upload one or more post images to Cloudinary");
    }

    await Promise.all(
      cloudinaryUrls.map(async (url) => {
        await insertImages(post_id, url);
      })
    );

    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "success",
        statusCode: 200,
        msg: "Post created successfully🔥",
        data: { post_id },
      })
    );
  } catch (error) {
    console.log("error while uploading post : ", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error",
      })
    );
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const [postData] = await fetchPost();

    if (postData.length === 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 200,
          status: "success",
          msg: "Post data not found",
        })
      );
    }
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data: { postData },
        msg: "Post data not found",
      })
    );
  } catch (error) {
    console.error("Error while fetching post details:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error while fetching post",
      })
    );
  }
};

exports.addLike = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.userId;

    const [userLikedPost] = await checkIfUserLikedPost(userId, postId);

    if (userLikedPost.length > 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "You have already liked this post",
        })
      );
    }

    await addLikeToPost(userId, postId);
    [likeCountResult] = await getLikeCountForPost(postId);
    [ownerUser] = await getUserIdFromPostId(postId);

    [followerList] = await getFollowersOfUser(ownerUser[0].user_id);
    const followerIds = followerList.map((row) => row.follower_id);

    const wss = getWebSocketServer();

    wss.clients.forEach((client) => {
      if (client.userId && followerIds.includes(client.userId)) {
        client.send(
          JSON.stringify({
            type: "likeAdded",
            likeCount: likeCountResult[0].likeCount,
            postId: postId,
          })
        );
      }
    });

    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "success",
        statusCode: 200,
        msg: "Like added to post successfully💗",
      })
    );
  } catch (error) {
    console.error("Error while adding like to post:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "Internal server error",
      })
    );
  }
};

exports.removeLike = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.userId;

    await removeLikeFromPost(userId, postId);
    [likeCountResult] = await getLikeCountForPost(postId);
    [ownerUser] = await getUserIdFromPostId(postId);

    [followerList] = await getFollowersOfUser(ownerUser[0].user_id);
    const followerIds = followerList.map((row) => row.follower_id);

    const wss = getWebSocketServer();

    wss.clients.forEach((client) => {
      if (client.userId && followerIds.includes(client.userId)) {
        client.send(
          JSON.stringify({
            type: "likeRemoved",
            likeCount: likeCountResult[0].likeCount,
            postId: postId,
          })
        );
      }
    });

    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "success",
        statusCode: 200,
        msg: "Like removed from post successfully",
      })
    );
  } catch (error) {
    console.error("Error while removing like from post:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "Internal server error",
      })
    );
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const { comment } = req.body;
    const userId = req.user.userId;

    const [commentsResult] = await addCommentToPost(comment, userId, postId);
    const [commentCountResult] = await getCommentCountForPost(postId);
    const [commentResult] = await fetchSingleComment(
      commentsResult.insertId,
      postId,
      userId
    );
    const [ownerUser] = await getUserIdFromPostId(postId);

    const [followerList] = await getFollowersOfUser(ownerUser[0].user_id);
    const followerIds = followerList.map((row) => row.follower_id);

    const wss = getWebSocketServer();

    wss.clients.forEach((client) => {
      if (client.userId && followerIds.includes(client.userId)) {
        client.send(
          JSON.stringify({
            type: "commentAdded",
            commentCount: commentCountResult[0].commentCount,
            commentData: commentResult[0],
            postId: postId,
          })
        );
      }
    });

    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        msg: "Comment added to post successfully",
      })
    );
  } catch (error) {
    console.error("Error while adding comment to post:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "Internal server error",
      })
    );
  }
};

exports.removeComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.userId;

    await removeCommentFromPost(commentId, userId);
    const [commentCountResult] = await getCommentCountForPost(postId);
    const [ownerUser] = await getUserIdFromPostId(postId);

    const [followerList] = await getFollowersOfUser(ownerUser[0].user_id);
    const followerIds = followerList.map((row) => row.follower_id);

    const wss = getWebSocketServer();

    wss.clients.forEach((client) => {
      if (client.userId && followerIds.includes(client.userId)) {
        client.send(
          JSON.stringify({
            type: "commentRemoved",
            commentCount: commentCountResult[0].commentCount,
            commentId: commentId,
            postId: postId,
          })
        );
      }
    });

    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        msg: "Comment removed from post successfully",
      })
    );
  } catch (error) {
    console.error("Error while removing comment from post:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "Internal server error",
      })
    );
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    const [commentsResult] = await fetchComments(postId);

    if (commentsResult.length === 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 200,
          status: "success",
          msg: "No comments found for this post🙁",
        })
      );
    }

    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data: {
          comments: commentsResult,
        },
        msg: "All comments fetched successfully✅",
      })
    );
  } catch {
    console.error("Error while fetching comments of posts:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "Internal server error",
      })
    );
  }
};

exports.followerCount = async (req, res, next) => {
  try {
    const userId=req.user.userId;
    const [followerCount] = await getTotalFollowersCount(userId);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data:followerCount[0],
        msg: "Total followers count fetched successfully✅",
      })
    );
  } catch {
    console.error("Error while fetching followers count:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "Internal server error",
      })
    );
  }
};

exports.followingCount = async (req, res, next) => {
  try {
    const userId=req.user.userId;
    const [followingCount] = await getTotalFollowingCount(userId);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data: followingCount[0],
        msg: "Total followings count fetched successfully✅",
      })
    );
  } catch {
    console.error("Error while fetching following count:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "Internal server error",
      })
    );
  }
};

exports.postCount = async (req, res, next) => {
  try {
    const userId=req.user.userId;
    const [postsCount] = await getTotalPostCount(userId);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data: postsCount[0],
        msg: "Total post count fetched successfully✅",
      })
    );
  } catch {
    console.error("Error while fetching post count:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "Internal server error",
      })
    );
  }
};

