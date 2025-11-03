import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('creem-signature');

    // 验证 webhook 签名
    const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET;

    if (!CREEM_WEBHOOK_SECRET || !signature) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 这里应该验证签名，具体方法依赖于 Creem 的文档
    // 简化示例，实际使用时需要根据 Creem 文档实现签名验证

    const event = JSON.parse(body);

    // 处理不同的事件类型
    switch (event.type) {
      case 'checkout.completed':
        await handleCheckoutCompleted(event.data);
        break;
      case 'subscription.active':
        await handleSubscriptionActive(event.data);
        break;
      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data);
        break;
      case 'subscription.expired':
        await handleSubscriptionExpired(event.data);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(data: { metadata: { userId: string; planId: string; interval: string }; customer_email: string; amount: number; currency: string }) {
  try {
    const { metadata, customer_email, amount, currency } = data;
    const { userId, planId, interval } = metadata;

    // 更新用户订阅状态
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        interval: interval,
        amount: amount,
        currency: currency,
        customer_email: customer_email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating subscription:', error);
    }
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function handleSubscriptionActive(data: { metadata: { userId: string } }) {
  try {
    const { metadata } = data;
    const { userId } = metadata;

    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating subscription status:', error);
    }
  } catch (error) {
    console.error('Error handling subscription active:', error);
  }
}

async function handleSubscriptionCanceled(data: { metadata: { userId: string } }) {
  try {
    const { metadata } = data;
    const { userId } = metadata;

    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating subscription status:', error);
    }
  } catch (error) {
    console.error('Error handling subscription canceled:', error);
  }
}

async function handleSubscriptionExpired(data: { metadata: { userId: string } }) {
  try {
    const { metadata } = data;
    const { userId } = metadata;

    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating subscription status:', error);
    }
  } catch (error) {
    console.error('Error handling subscription expired:', error);
  }
}