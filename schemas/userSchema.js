import mongoose, {Schema, model, models, trusted} from 'mongoose';
import Book from "./bookSchema"

const UserSchema = new Schema({

    wallet: {
        type: String,
        default: "",
        unique: false
    },
    collectionName: {
        type: String,
        default: "",
        unique: false
    },
    profileImage:{
        type: String,
        default: "",
        unique: false
    },
    collectionImage:{
        type: String,
        default: "",
        unique: false
    },
    banner:{
        type: String,
        default: "",
        unique: false
    },
    email:{
        type:String,
        unique: true,
        required: true
    },
    twitter:{
        type:String,
        required:false,
        default:""
    },
    instagram:{
        type:String,
        required:false,
        default:""
    },
    website:{
        type:String,
        required:false,
        default:""
    },
    farcaster:{
        type:String,
        required:false,
        default:""
    },
    username: {
        type: String,
        required: true,
    },
    readlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Book,
        default: []
    }],
    yourBooks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Book,
        default: []
    }],
    mintedBooks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Book,
        default: []
    }],
    searchHistory: {
        type: [String],
        default: null
    },
    contractAdd: {
        type: String,
        default:"",
        unique: false
    },
    role: {
        type: String,
        default: "USER",
        unique: false
    },
  }, {collection: "users"})

  const User = models.User || model('User', UserSchema);

  UserSchema.index({ username: 'text', wallet: 'text', collection: 'text' });

  export default User