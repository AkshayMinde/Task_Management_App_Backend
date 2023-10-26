const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    }
})

// ! Hashing the password before saving

// userSchema.pre('save', async (next) => {
//     try {
//         if(! mongoose.isModified('password')){
//             return next();
//         }
//         const securedPassword = await bcrypt.hash(this.password, 10);
//         this.password = securedPassword;
//         return next();
//     } catch (error) {
//         return next(error);
//     }
// })

module.exports = mongoose.model('users', userSchema);