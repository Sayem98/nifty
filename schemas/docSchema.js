import { ObjectId } from 'mongodb';
import mongoose, {Schema, model, models, trusted} from 'mongoose';

const BookSchema = new Schema({

    name: {
        type: String,
        default: null,
        unique: false,
        required: true
    },
    content: {
        type: Object,
        default: {},
        unique: false
    },
    author: {
        type: ObjectId,
        default: null,
        unique: false,
        required: true
    },
    pdf:{
        type: String,
        default: null,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }

  }, {collection: "documents"})

  const Book = models.Book || model('Document', BookSchema);

  export default Book