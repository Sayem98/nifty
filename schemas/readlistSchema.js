import mongoose, {Schema, model, models, trusted} from 'mongoose';
import User from './userSchema';
import Book from './bookSchema';

const ReadlistSchema = new Schema({

    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Book,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }

  }, {collection: "readlists"})

  const Readlists = models.Readlists || model('Readlists', ReadlistSchema);

  export default Readlists