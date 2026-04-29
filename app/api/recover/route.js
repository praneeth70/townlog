import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// This is the key you just generated
const resend = new Resend('re_GWuYAeRC_Bmr2Hq3E3XkstABDmNmirkaE');

export async function POST(request) {
  try {
    const { email } = await request.json();

    // 1. Check if the shop exists with this email
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id, shop_name')
      .eq('owner_email', email)
      .single();

    if (!shop || shopError) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    // 2. Get the Owner's PIN
    const { data: owner } = await supabase
      .from('employees')
      .select('pin')
      .eq('shop_id', shop.id)
      .eq('role', 'owner')
      .single();

    // 3. Send the actual email via Resend
    await resend.emails.send({
      from: 'TownLog <onboarding@resend.dev>',
      to: email, // NOTE: On Free Tier, this MUST be your verified email
      subject: `TownLog Recovery: ${shop.shop_name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #0f0f13; color: white; border-radius: 20px;">
          <h2 style="color: #ff6b35;">TownLog Access Details</h2>
          <p>You requested a recovery for <strong>${shop.shop_name}</strong>.</p>
          <div style="background: #1a1a22; padding: 20px; border-radius: 15px; border: 1px solid #2a2a38;">
            <p style="margin: 5px 0;"><strong>Shop ID:</strong> <code style="color: #ff6b35;">${shop.id}</code></p>
            <p style="margin: 5px 0;"><strong>Owner PIN:</strong> <code style="color: #ff6b35;">${owner?.pin || 'Not Set'}</code></p>
          </div>
          <p style="font-size: 10px; color: #555; margin-top: 20px;">Secure your Ledger. Do not share these details.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}