import { NextResponse } from 'next/server';
import { getDatasetByConversationId } from '@/lib/database';

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

    const dataset = await getDatasetByConversationId(conversationId);

    return NextResponse.json({
      success: true,
      dataset: dataset,
    });
  } catch (error) {
    console.error('Error in /api/dataset GET:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}