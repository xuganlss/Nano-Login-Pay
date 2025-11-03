import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { planId, price, interval, userId, userEmail } = await request.json();

    if (!planId || !price || !interval || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Creem API 配置
    const CREEM_API_KEY = process.env.CREEM_API_KEY;

    if (!CREEM_API_KEY) {
      return NextResponse.json({ error: 'Creem API key not configured' }, { status: 500 });
    }

    console.log('Payment request:', { planId, price, interval, userId, userEmail });

    console.log('Using Creem API with key:', CREEM_API_KEY ? `${CREEM_API_KEY.substring(0, 10)}...` : 'Not provided');

    // 产品ID映射
    const productIdMap: Record<string, string> = {
      basic: 'prod_2lcc78zV8urc8jrYQNh3ls',
      pro: 'prod_YJ5PZbRFcdo5Q7ZxwU2U0', // 使用真实的Pro产品ID
      // 如果需要更多计划，在这里添加
    };

    const productId = productIdMap[planId] || productIdMap.basic; // 默认使用basic

    // 如果是测试环境，直接跳转到Creem测试支付页面
    if (CREEM_API_KEY && CREEM_API_KEY.startsWith('creem_test_')) {
      console.log('🔗 Using direct Creem test payment page');
      console.log('Selected product ID for plan', planId, ':', productId);

      // 直接跳转到Creem的测试支付页面，使用正确的产品ID
      const testPaymentUrl = `https://www.creem.io/test/payment/${productId}?metadata[userId]=${userId}&metadata[planId]=${planId}&metadata[interval]=${interval}&metadata[price]=${price}&metadata[email]=${encodeURIComponent(userEmail || '')}`;

      console.log('Redirecting to Creem test payment:', testPaymentUrl);

      return NextResponse.json({
        checkoutUrl: testPaymentUrl,
        message: `Creem test payment for ${planId} plan (${productId})`
      });
    }

    // 生产环境：真实的 Creem API 调用
    const checkoutData = {
      request_id: `nano-${planId}-${userId}-${Date.now()}`,
      product_id: productId, // 使用动态选择的产品ID
      units: 1,
      customer_email: userEmail || `user-${userId}@example.com`,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'}/success?plan=${planId}`,
      metadata: {
        planId,
        userId,
        interval,
        price: price.toString()
      }
    };

    console.log('Sending to Creem:', JSON.stringify(checkoutData, null, 2));

    // 调用 Creem API - 使用正确的端点和认证方式
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': CREEM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    const responseText = await response.text();
    console.log('Creem response status:', response.status);
    console.log('Creem response:', responseText);

    if (!response.ok) {
      console.error('Creem API error:', responseText);

      // 如果是产品不存在的错误，尝试创建产品
      if (response.status === 404 || responseText.includes('product_id')) {
        console.log('Product not found, attempting to create...');
        const createProductResult = await createProduct(planId, price, interval);

        if (createProductResult.success) {
          // 重新尝试创建 checkout
          checkoutData.product_id = createProductResult.product_id;
          const retryResponse = await fetch('https://api.creem.io/v1/checkouts', {
            method: 'POST',
            headers: {
              'x-api-key': CREEM_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutData),
          });

          if (retryResponse.ok) {
            const retrySession = await retryResponse.json();
            return NextResponse.json({
              checkoutUrl: retrySession.checkout_url
            });
          }
        }
      }

      // 如果 Creem API 失败，回退到模拟支付
      console.log('🚧 Creem API failed, falling back to mock payment');
      const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'}/success?plan=${planId}&mock=true`;

      return NextResponse.json({
        checkoutUrl: successUrl,
        message: 'Fallback to mock payment due to API error'
      });
    }

    const checkoutSession = JSON.parse(responseText);

    return NextResponse.json({
      checkoutUrl: checkoutSession.checkout_url
    });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

// 辅助函数：创建产品
async function createProduct(planId: string, price: number, interval: string) {
  try {
    const CREEM_API_KEY = process.env.CREEM_API_KEY;

    const productData = {
      id: `nano_banana_${planId}_${interval}`,
      name: `Nano Banana ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
      description: `${planId} plan subscription for Nano Banana AI image editing`,
      price: price,
      currency: 'usd',
      billing_cycle: interval === 'year' ? 'yearly' : 'monthly',
      features: [
        `${interval === 'year' ? 'Annual' : 'Monthly'} subscription`,
        'AI image editing',
        'Premium features access'
      ]
    };

    const response = await fetch('https://api.creem.io/v1/products', {
      method: 'POST',
      headers: {
        'x-api-key': CREEM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (response.ok) {
      const product = await response.json();
      return { success: true, product_id: product.id };
    } else {
      const errorText = await response.text();
      console.error('Product creation failed:', errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('Product creation error:', error);
    return { success: false, error: error.message };
  }
}