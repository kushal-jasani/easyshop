const db = require("../util/database");

const userDetailsFromId = async (userId) => {
  return await db.query("select firstname,lastname,email,phoneno from users where id=?",[userId]);
};

const updateUserDetails=async(updatedFields,userId)=>{
    return await db.query('update users set ? where id=?',[updatedFields,userId]);
}

const getCardDetailsFromUserId=async(userId)=>{
  return await db.query('select * from cards where userid=?',[userId]);
}

const insertCardDetails=async(userId,card_num,holder_name,expiry,cvv)=>{
  return await db.query('insert into cards set ?',{
    userid:userId,
    card_num:card_num,
    holder_name:holder_name,
    expiry:expiry,
    cvv:cvv
  })
}

const findDuplicateCard=async(card_num)=>{
  return await db.query('select id from cards where card_num=?',[card_num])
}

module.exports = {userDetailsFromId,updateUserDetails,getCardDetailsFromUserId,insertCardDetails,findDuplicateCard};
