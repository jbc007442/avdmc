import { NextResponse } from 'next/server';

const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const WABA_ID = process.env.WHATSAPP_WABA_ID!; // 1062952783327668
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!; // 1291947837325825
const VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';

export async function GET() {
  const results: any = { waba_id: WABA_ID, phone_id: PHONE_ID };

  // 1. Check token is valid and what permissions it has
  try {
    const meRes = await fetch(`https://graph.facebook.com/${VERSION}/me?fields=id,name`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    results.token_check = { status: meRes.status, data: await meRes.json() };
  } catch (e: any) {
    results.token_check = { error: e.message };
  }

  // 2. Check WABA details
  try {
    const wabaRes = await fetch(
      `https://graph.facebook.com/${VERSION}/${WABA_ID}?fields=id,name,message_templates`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    results.waba_check = { status: wabaRes.status, data: await wabaRes.json() };
  } catch (e: any) {
    results.waba_check = { error: e.message };
  }

  // 3. Check Phone Number
  try {
    const phoneRes = await fetch(
      `https://graph.facebook.com/${VERSION}/${PHONE_ID}?fields=id,display_phone_number,verified_name`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    results.phone_check = { status: phoneRes.status, data: await phoneRes.json() };
  } catch (e: any) {
    results.phone_check = { error: e.message };
  }

  // 4. Fetch templates - ALL statuses
  try {
    const tplRes = await fetch(
      `https://graph.facebook.com/${VERSION}/${WABA_ID}/message_templates?fields=name,language,status,category,components&limit=100`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const tplData = await tplRes.json();
    results.templates_check = {
      status: tplRes.status,
      data: tplData,
      count: tplData?.data?.length || 0,
    };
  } catch (e: any) {
    results.templates_check = { error: e.message };
  }

  return NextResponse.json(results, { status: 200 });
}
