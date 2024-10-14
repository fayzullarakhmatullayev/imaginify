"use server";
import Stripe from "stripe";
import { redirect } from "next/navigation";
import { handleError } from "@/utils";
import { connectToDatabase } from "@/lib/database/mongoose";
import TransactionModel from "@/lib/database/models/transaction.model";
import { updateCredits } from "@/lib/actions/user.actions";

export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const amount = Number(transaction.amount) * 100;
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "USD",
          unit_amount: amount,
          product_data: { name: transaction.plan },
        },
        quantity: 1,
      },
    ],
    metadata: {
      plan: transaction.plan,
      credits: transaction.credits,
      buyerId: transaction.buyerId,
    },
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SERVICE_URL}/profile`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVICE_URL}/`,
  });

  redirect(session.url!);
}

export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    await connectToDatabase();

    // Create a new transaction with buyer id
    const newTransaction = await TransactionModel.create({
      ...transaction,
      buyer: transaction.buyerId,
    });

    await updateCredits(transaction.buyerId, transaction.credits);

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (err) {
    handleError(err);
  }
}
