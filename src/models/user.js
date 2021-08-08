const { DataTypes} = require("sequelize");
const db =require("../config/database/db");
const bcrypt = require('bcrypt-nodejs');

const User=db.define(
  "user",{
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull:false,
    },
    user_facebookid: {
      type: DataTypes.STRING,
    },
    user_googleid:{
      type: DataTypes.STRING,
    },
    user_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_password: {
      type: DataTypes.STRING,
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull:false,
    },
    user_phone: {
      type: DataTypes.STRING,
     
    },
    user_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_accessTokenFB: {
      type: DataTypes.STRING,
    },
    user_accessTokenGG: {
      type: DataTypes.STRING,
    },
    user_codereset:{
      type: DataTypes.STRING,
      allowNull: true
    },
    user_verify:{
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    user_role: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull:false,
    },
  }, 
{timestamps: false, createdAt: false, updatedAt: false});

User.findUserByEmail = async function (user_email) {
  return User.findOne({
      where:{
        user_email,
      }
  })
};

User.finUserdById = async function (user_id) {
  return User.findByPk(user_id);  
};

User.findUserByFacebookId = async function (user_facebookid){
  return User.findOne({
    where:{
      user_facebookid,
    }
  })
};

User.findUserByGoogleId = async function (user_googleid){
  return User.findOne({
    where:{
      user_googleid,
    }
  })
};

//sinh chuỗi hash
User.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSalt(8),null);
};

User.validPassword = function(password){
  return bcrypt.compareSync(password, this.user.user_password);
};

module.exports = User;