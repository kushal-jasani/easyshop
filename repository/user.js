const db = require("../util/database");

const userDetailsFromId = async (userId) => {
  return await db.query("select firstname,lastname,email,phoneno from users where id=?",[userId]);
};

const updateUserDetails=async(updatedFields,userId)=>{
    return await db.query('update users set ? where id=?',[updatedFields,userId]);
}
module.exports = {userDetailsFromId,updateUserDetails};
