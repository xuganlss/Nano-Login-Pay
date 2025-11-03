import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // 查询用户订阅记录
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
    }

    // 查询用户积分记录
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .order('created_at', { ascending: false });

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
    }

    // 查询积分交易记录
    const { data: transactions, error: transError } = await supabase
      .from('credit_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (transError) {
      console.error('Error fetching transactions:', transError);
    }

    return NextResponse.json({
      subscriptions: subscriptions || [],
      credits: credits || [],
      transactions: transactions || [],
      summary: {
        totalSubscriptions: subscriptions?.length || 0,
        activeSubscriptions: subscriptions?.filter(s => s.status === 'active').length || 0,
        totalUsers: credits?.length || 0,
        totalTransactions: transactions?.length || 0
      }
    });

  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({
      error: 'Failed to fetch payment records',
      details: error.message
    }, { status: 500 });
  }
}