import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await admin.rpc("process_paid_order", {
        order_id_input: orderId,
        payment_intent_input: session.payment_intent
      });
    }
  }

  return NextResponse.json({ received: true });
}
