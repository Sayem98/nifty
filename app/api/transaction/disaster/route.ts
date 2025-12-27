import { NextResponse } from 'next/server';

import Transactions from '@/schemas/transactionSchema';
import Book from '@/schemas/bookSchema';
import { connectToDB } from '@/utils/db';

export async function GET() {
    try {
        await connectToDB();

        // Get all transactions
        const transactions = await Transactions.find({});

        let updateCount = 0;
        let errorCount = 0;

        for (const transaction of transactions) {
            try {

                // Find the associated book
                const book = await Book.findById(transaction.book);

                console.log(book)
                
                if (!book) {
                    console.error(`Book not found for transaction ${transaction._id}`);
                    errorCount++;
                    continue;
                }

                // Calculate amount (handle division by zero)
                let amount = 0;
                if (book.price && book.price > 0) {
                    amount = transaction.value / book.price;
                } else {
                    console.error(`Invalid book price for transaction ${transaction._id}`);
                    errorCount++;
                    continue;
                }

                // Update the transaction with the calculated amount
                await Transactions.findByIdAndUpdate(
                    transaction._id,
                    { amount: amount },
                    { new: true }
                );

                updateCount++;
            } catch (error) {
                console.error(`Error processing transaction ${transaction._id}:`, error);
                errorCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Updated ${updateCount} transactions. Failed: ${errorCount}`,
        });

    } catch (error) {
        console.error('Route error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}