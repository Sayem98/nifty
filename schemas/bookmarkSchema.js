import mongoose, {Schema, model, models, trusted} from 'mongoose';
import User from './userSchema';
import Book from './bookSchema';

const BookmarkSchema = new Schema({

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
    page:{
        type: String,
        required: true
    },

  }, {collection: "bookmarks"})

  const Bookmarks = models.Bookmarks || model('Bookmarks', BookmarkSchema);

  export default Bookmarks