import { NextRequest, NextResponse } from 'next/server';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;

/**
 * Meta Verification
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook Verified');

    return new NextResponse(challenge, {
      status: 200,
    });
  }

  return NextResponse.json(
    {
      success: false,
      message: 'Verification failed',
    },
    { status: 403 }
  );
}

/**
 * Incoming Messages / Status Updates
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log('Webhook Event', JSON.stringify(body, null, 2));

    /**
     * Save to MongoDB
     * Update message status
     * Handle incoming messages
     */

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}
