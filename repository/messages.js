const db = require("../util/database");

const insertPersonalMessage = async (senderId, receiverId, message) => {
  return await db.query("INSERT INTO user_messages SET ?", {
    sender_id: senderId,
    receiver_id: receiverId,
    message: message,
  });
};

const isUserInGroup=async(senderId,groupId)=>{
  return await db.query('SELECT COUNT(*) AS count FROM group_members WHERE member_id = ? AND group_id = ?',[senderId,groupId])
}

const getGroupMembers=async(groupId)=>{
  return await db.query('SELECT member_id FROM group_members WHERE group_id=?',[groupId])
}

const insertGroupMessage=async(groupId,senderId,message)=>{
  return await db.query("INSERT INTO group_messages SET ?", {
    group_id:groupId,
    sender_id: senderId,
    message: message
  })
}
module.exports = {
  insertPersonalMessage,
  getGroupMembers,
  insertGroupMessage,isUserInGroup
};
