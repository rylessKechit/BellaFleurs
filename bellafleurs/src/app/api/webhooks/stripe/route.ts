// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('❌ Signature Stripe manquante');
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('❌ Erreur de signature webhook:', error.message);
    return NextResponse.json({ error: `Erreur de signature: ${error.message}` }, { status: 400 });
  }

  await connectDB();
  console.log(`🔔 Webhook reçu: ${event.type}`);

  try {
    if (event.type === 'payment_intent.succeeded') {
      await handlePaymentIntentSucceeded(event.data.object);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`❌ Erreur traitement webhook:`, error);
    return NextResponse.json({ error: 'Erreur traitement webhook' }, { status: 500 });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    console.log('✅ Paiement réussi, création de la commande...', paymentIntent.id);

    const metadata = paymentIntent.metadata;
    
    if (!metadata.customer_email || !metadata.customer_name) {
      console.error('❌ Métadonnées manquantes');
      return;
    }

    // Générer le numéro de commande
    const orderNumber = await Order.generateOrderNumber();

    // Reconstituer les données depuis les métadonnées
    const orderData = {
      orderNumber,
      user: metadata.user_id !== 'guest' ? metadata.user_id : null,
      items: parseItemsFromMetadata(metadata.items || ''),
      totalAmount: parseFloat(metadata.total_amount || '0'),
      status: 'payée',
      paymentStatus: 'paid',
      paymentMethod: metadata.payment_method || 'card',
      stripePaymentIntentId: paymentIntent.id,
      deliveryInfo: {
        type: metadata.delivery_type as 'delivery' | 'pickup',
        address: metadata.delivery_address ? parseAddressFromMetadata(metadata.delivery_address) : undefined,
        date: new Date(metadata.delivery_date),
        notes: metadata.delivery_notes || undefined
      },
      customerInfo: {
        name: metadata.customer_name,
        email: metadata.customer_email,
        phone: metadata.customer_phone || ''
      },
      timeline: [{
        status: 'payée',
        date: new Date(),
        note: 'Commande payée et créée automatiquement'
      }]
    };

    const order = new Order(orderData);
    await order.save();

    console.log('✅ Commande créée:', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      amount: paymentIntent.amount_received / 100
    });

  } catch (error) {
    console.error('❌ Erreur création commande:', error);
    throw error;
  }
}

function parseAddressFromMetadata(addressString: string) {
  const parts = addressString.split(', ');
  if (parts.length >= 2) {
    const street = parts[0];
    const cityZip = parts[1].split(' ');
    const zipCode = cityZip.pop() || '';
    const city = cityZip.join(' ');
    
    return { street, city, zipCode, complement: '' };
  }
  
  return { street: addressString, city: '', zipCode: '', complement: '' };
}

function parseItemsFromMetadata(itemsString: string) {
  if (!itemsString) return [];
  
  return itemsString.split('|').map((item, index) => {
    const parts = item.split(':');
    if (parts.length === 2) {
      const name = parts[0];
      const quantityPrice = parts[1];
      const match = quantityPrice.match(/(\d+)x([\d.]+)€/);
      
      if (match) {
        const quantity = parseInt(match[1]);
        const price = parseFloat(match[2]);
        
        return {
          product: `temp_product_${index}`,
          name,
          price,
          quantity,
          image: ''
        };
      }
    }
    
    return {
      product: `temp_product_${index}`,
      name: item,
      price: 0,
      quantity: 1,
      image: ''
    };
  });
}