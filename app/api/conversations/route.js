import { NextResponse } from 'next/server';
import {
  getConversations,
  createConversation,
  deleteConversation,
} from '../../../lib/database';


export const dynamic = 'force-dynamic';


//Route to Get all Conversations from the Databse
export async function GET() {
  try {
    const conversations = await getConversations();
    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

//Route to Create a new Conversation
export async function POST() {
  try {
    const conversation = await createConversation();
    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


//Route to Delete a Conversation by ID
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    await deleteConversation(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}