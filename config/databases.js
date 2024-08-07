const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/authentication');

const userSchema = new Schema({
    username :{
        type : String,
        require
    },
    password :{
        type :String,
        require
    }

   
});

const UserModel = mongoose.model('User',userSchema);

module.exports= UserModel;

