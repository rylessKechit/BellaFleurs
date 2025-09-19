// src/app/api/webhooks/stripe/route.ts - Version avec support variants
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import { sendOrderConfirmation, sendNewOrderNotification } from '@/lib/email';

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

    // Vérifier si la commande existe déjà
    const existingOrder = await Order.findOne({ 
      stripePaymentIntentId: paymentIntent.id 
    });
    
    if (existingOrder) {
      console.log('⚠️ Commande déjà existante:', existingOrder.orderNumber);
      return;
    }

    // Générer le numéro de commande
    const orderNumber = await Order.generateOrderNumber();

    // NOUVEAU : Parser les items avec variants
    const items = parseItemsWithVariantsFromMetadata(metadata.items || '', metadata);

    // Reconstituer les données depuis les métadonnées
    const orderData = {
      orderNumber,
      user: metadata.user_id !== 'guest' ? metadata.user_id : null,
      items: items,
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
      timeline: [
        {
          status: 'payée',
          date: new Date(),
          note: metadata.has_variants === 'true' 
            ? `Commande créée et payée via Stripe (${metadata.variant_items_count || 0} items avec variants)`
            : 'Commande créée et payée via Stripe'
        }
      ]
    };

    // Créer la commande en base
    const order = new Order(orderData);
    await order.save();
    
    console.log('✅ Commande créée:', order.orderNumber);
    
    // Log des variants si présents
    if (metadata.has_variants === 'true') {
      console.log('🔧 Variants détectés:', {
        hasVariants: true,
        variantItemsCount: metadata.variant_items_count || 0,
        totalItems: items.length
      });
    }

    // Vider le panier si l'utilisateur est connecté
    if (metadata.user_id && metadata.user_id !== 'guest') {
      try {
        await Cart.deleteOne({ user: metadata.user_id });
        console.log('🛒 Panier vidé pour l\'utilisateur:', metadata.user_id);
      } catch (error) {
        console.warn('⚠️ Erreur lors du vidage du panier:', error);
      }
    }

    // ENVOYER LES EMAILS DE NOTIFICATION
    try {
      // 1. Email de confirmation au client
      console.log('📧 Envoi email de confirmation...');
      const confirmationSent = await sendOrderConfirmation(order);
      if (confirmationSent) {
        console.log('✅ Email de confirmation envoyé au client');
      } else {
        console.error('❌ Échec envoi email de confirmation');
      }

      // 2. Notification à l'admin
      console.log('📧 Envoi notification admin...');
      const adminNotificationSent = await sendNewOrderNotification(order);
      if (adminNotificationSent) {
        console.log('✅ Notification admin envoyée');
      } else {
        console.error('❌ Échec notification admin');
      }

      // Mettre à jour la commande avec le statut d'envoi des emails
      await Order.findByIdAndUpdate(order._id, {
        emailsSent: {
          confirmation: confirmationSent,
          adminNotification: adminNotificationSent,
          sentAt: new Date()
        }
      });

    } catch (emailError) {
      console.error('❌ Erreur envoi emails:', emailError);
      // Ne pas faire échouer le webhook pour autant
    }

  } catch (error: any) {
    console.error('❌ Erreur handlePaymentIntentSucceeded:', error);
    throw error;
  }
}

// FONCTION MISE À JOUR : Parser les items avec variants depuis les métadonnées
function parseItemsWithVariantsFromMetadata(itemsString: string, metadata: any): any[] {
  try {
    // Format avec variants: "Bouquet roses:2x25€[Grand]|Composition:1x45€"
    // Format simple: "Bouquet roses:2x25€|Composition:1x45€"
    
    const items = itemsString.split('|').map((itemStr, index) => {
      // Parse le format de base
      const [nameAndVariant, qtyPrice] = itemStr.split(':');
      const [qtyStr, priceStr] = qtyPrice.split('x');
      const quantity = parseInt(qtyStr);
      const price = parseFloat(priceStr.replace('€', ''));
      
      // Extraire le nom et le variant
      let name = nameAndVariant;
      let variantName: string | undefined = undefined;
      let variantId: string | undefined = undefined;
      
      // Vérifier si il y a un variant [Nom]
      const variantMatch = nameAndVariant.match(/^(.+)\[([^\]]+)\]$/);
      if (variantMatch) {
        name = variantMatch[1];
        variantName = variantMatch[2];
        
        // Essayer de récupérer l'ID du variant depuis les métadonnées
        if (metadata.has_variants === 'true' && metadata.variants) {
          const variants = metadata.variants.split('|');
          const variantInfo = variants.find((v: string) => v.endsWith(`:${variantName}`));
          if (variantInfo) {
            variantId = variantInfo.split(':')[0];
          }
        }
      }
      
      return {
        product: `product_${index}`, // ID temporaire, sera remplacé si nécessaire
        name: name.trim(),
        price: price,
        quantity: quantity,
        image: '', // Pas d'image dans les métadonnées
        // NOUVEAU : Support variants
        variantId: variantId,
        variantName: variantName
      };
    });

    return items;
  } catch (error) {
    console.error('❌ Erreur parsing items avec variants:', error);
    // Fallback vers l'ancienne méthode
    return parseItemsFromMetadata(itemsString);
  }
}

// Fonction utilitaire legacy (fallback)
function parseItemsFromMetadata(itemsString: string): any[] {
  try {
    // Format: "item1:qty1x€price1|item2:qty2x€price2"
    return itemsString.split('|').map((itemStr, index) => {
      const [name, qtyPrice] = itemStr.split(':');
      const [qtyStr, priceStr] = qtyPrice.split('x');
      const quantity = parseInt(qtyStr);
      const price = parseFloat(priceStr.replace('€', ''));
      
      return {
        product: `product_${index}`,
        name: name.trim(),
        quantity,
        price,
        image: ''
      };
    });
  } catch (error) {
    console.error('❌ Erreur parsing items legacy:', error);
    return [];
  }
}

function parseAddressFromMetadata(addressString: string): any {
  try {
    // Format simple: "street, city zipCode"
    const parts = addressString.split(',');
    if (parts.length >= 2) {
      const street = parts[0].trim();
      const cityZip = parts[1].trim().split(' ');
      const zipCode = cityZip.pop() || '';
      const city = cityZip.join(' ');
      
      return {
        street,
        city,
        zipCode,
        complement: ''
      };
    }
  } catch (error) {
    console.error('❌ Erreur parsing address:', error);
  }
  
  return {
    street: addressString,
    city: '',
    zipCode: '',
    complement: ''
  };
}