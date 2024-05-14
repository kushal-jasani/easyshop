const { sendHttpResponse, generateResponse } = require("../helper/response");
const { insertPersonalMessage, getGroupMembers, insertGroupMessage, isUserInGroup } = require("../repository/messages");
const { getClientByUserId } = require("../util/websocket");

exports.sendPersonalMessage = async (req, res, next) => {
  try {
    const senderId = req.user.userId;
    const { receiverId, message } = req.body;


    const recipientSocket = getClientByUserId(receiverId);

    if (recipientSocket) {
      recipientSocket.send(
        JSON.stringify({ type: "newPersonalMessage", senderId, message })
      );
    }

    const [insertResult] = await insertPersonalMessage(
      senderId,
      receiverId,
      message
    );

    if (!insertResult) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "Error in stroing message",
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
        msg: "Message sent successfully⚡️",
      })
    );
  } catch (error){
    console.log("error while sending personsal message", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error while sending personsal message",
      })
    );
  }
};

exports.sendGroupMessage = async (req, res, next) => {
  try {
    const senderId = req.user.userId;
    const { groupId, message } = req.body;

    const [result]=await isUserInGroup(senderId,groupId);

    if(!result[0].count>0){
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 403,
          msg: "You can't send message in group,you're not a member.",
        })
      );
    }

    const [groupMembers]=await getGroupMembers(groupId);

    groupMembers.forEach(async member=>{
      const memberSocket = await getClientByUserId(member.member_id);
      if(memberSocket){
        memberSocket.send(JSON.stringify({
          type:'groupMessage',
          groupId,
          senderId,
          message
        }))
      }
    })

    const [insertResult] = await insertGroupMessage(
      groupId,
      senderId,
      message
    );

    if (!insertResult) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "Error in stroing group message",
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
        msg: "Message sent to group successfully⚡️",
      })
    );
  } catch (error){
    console.log("error while sending personsal message", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error while sending group message",
      })
    );
  }
};
