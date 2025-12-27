import mongoose, {Schema, model, models, trusted} from 'mongoose';
import User from './userSchema';
import Book from './bookSchema';

const BookReportSchema = new Schema({

    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Book,
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    tag:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }

  }, {collection: "book-reports"})

  const BookReports = models.BookReports || model('BookReports', BookReportSchema);

  export default BookReports