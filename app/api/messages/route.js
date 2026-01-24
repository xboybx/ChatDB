import { NextResponse } from 'next/server';
import { getMessages } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'conversationId is required' },
        { status: 400 }
      );
    }

    const messages = await getMessages(conversationId);

    return NextResponse.json({
      success: true,
      messages: messages,
    });
  } catch (error) {
    console.error('Error in /api/messages GET:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}