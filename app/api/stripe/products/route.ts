import { NextResponse } from 'next/server';
import { requireMaster } from '@/lib/auth/authorization';
import { stripe } from '@/lib/stripe/server';

export async function GET() {
  try {
    await requireMaster();
    
    console.log('Listing Stripe products...');
    const products = await stripe.products.list({ limit: 10 });
    
    console.log(`Found ${products.data.length} products in Stripe`);
    
    return NextResponse.json({
      products: products.data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        metadata: product.metadata,
        created: product.created
      }))
    });
  } catch (error: any) {
    console.error('Error listing Stripe products:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
