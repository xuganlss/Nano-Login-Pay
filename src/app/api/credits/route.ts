import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 查询用户积分
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('total_credits, used_credits, available_credits')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // 如果用户没有积分记录，创建一个默认记录
      if (error.code === 'PGRST116') {
        const { data: newCredits, error: insertError } = await supabase
          .from('user_credits')
          .insert([
            {
              user_id: user.id,
              total_credits: 0,
              used_credits: 0
            }
          ])
          .select('total_credits, used_credits, available_credits')
          .single();

        if (insertError) {
          console.error('Error creating credits record:', insertError);
          return NextResponse.json({ error: 'Failed to create credits record' }, { status: 500 });
        }

        return NextResponse.json(newCredits);
      }

      console.error('Error fetching credits:', error);
      return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }

    return NextResponse.json(credits);

  } catch (error) {
    console.error('Credits API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, amount } = await request.json();
    const supabase = await createClient();

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'use') {
      // 使用积分
      const { data: currentCredits, error: fetchError } = await supabase
        .from('user_credits')
        .select('available_credits')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        return NextResponse.json({ error: 'Failed to fetch current credits' }, { status: 500 });
      }

      if (currentCredits.available_credits < amount) {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
      }

      // 更新已使用积分
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          used_credits: supabase.sql`used_credits + ${amount}`,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
      }

      // 记录交易
      await supabase
        .from('credit_transactions')
        .insert([
          {
            user_id: user.id,
            credits_used: amount,
            transaction_type: 'usage',
            description: 'AI image generation'
          }
        ]);

      return NextResponse.json({ success: true, message: 'Credits used successfully' });

    } else if (action === 'add') {
      // 添加积分
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          total_credits: supabase.sql`total_credits + ${amount}`,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 });
      }

      // 记录交易
      await supabase
        .from('credit_transactions')
        .insert([
          {
            user_id: user.id,
            credits_used: -amount, // 负数表示添加
            transaction_type: 'purchase',
            description: 'Credits purchased'
          }
        ]);

      return NextResponse.json({ success: true, message: 'Credits added successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Credits update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}