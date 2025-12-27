
import { ObjectId } from 'mongodb';
import mongoose, {Schema, model, models, trusted} from 'mongoose';


const BookSchema = new Schema({

    name: {
        type: String,
        default: null,
        unique: false,
        required: true
    },
    isAdminRemoved: {
        type:Boolean,
        default:false
    },
    isPaused:{
        type:Boolean,
        default: false,
    },
    isPublished: {
        type: Boolean,
        default: false,
        unique: false
    },
    isHidden:{
        type: Boolean,
        default: false,
        unique: false
    },
    price: {
        type: Number,
        default: 0,
        unique: false
    },
    maxMint: {
        type: Number,
        default: 0,
        unique: false
    },
    minted: {
        type: Number,
        default: 0,
        unique: false
    },
    cover: {
        type: String,
        default: null,
        unique: false
    },
    audiobook: {
        type: String,
        default: "",
        unique: false
    },
    author: {
        type: ObjectId,
        default: null,
        unique: false,
        required: true
    },
    artist: {
        type: String,
        default: "",
        unique: false
    },
    mintEnds:{
        type: String,
        default: "",
        unique: false
    },
    maxMintsPerWallet:{
        type: Number,
        default: 0,
        unique: false,
    },
    tokenId:{
        type: Number,
        required: false
    },
    contractAddress: {
        type: String,
        default: "",
        required: false
    },
    mintExclusiveTo: {
        type: String,
        default: "",
        required: false
    },
    ISBN:{
        type:String,
        // unique: true,
        default: "",
        required: false
    },
    description: {
        type: String,
        default: null,
        unique: false
    },
    tags: {
        type: [String],
        default: []
    }, 
    pdf:{
        type: String,
        default: null,
    },
    readers: {
        type: Number,
        default: 0
    },
    isBoosted:{
        type: String,
        default: ""
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
    
  }, {collection: "books"})

  const Book = models.Book || model('Book', BookSchema);

  BookSchema.index({ name: 'text'});


  export default Book