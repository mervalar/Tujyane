const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
            fullname:{type:String, required:true},
            email:{type:String, required:true, unique:true},
            password:{type:String, required:true},
            phone:{type:String, required:true, unique:true},
            role:{type:String,  enum:['passenger', 'driver', 'admin']},
            avatar:{type:String, default:null},
            
            lastLoginAt:{type:Date, required:false},
            isActive:{type:Boolean,  default:true},
            isVerified:{type:Boolean,default:false},
},{timestamps:true});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;