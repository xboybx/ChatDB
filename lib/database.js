import { createClient } from '@supabase/supabase-js';

// Centralized Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Fetches a dataset by its ID.
 * @param {string} datasetId - The ID of the dataset.
 * @returns {Promise<object>} The dataset object.
 */
export async function getDatasetById(datasetId) {
    const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', datasetId)
        .single();

    if (error) {
        console.error('Error fetching dataset:', error);
        throw new Error('Failed to fetch dataset details.');
    }

    return data;
}

/**
 * Saves a new message to the database.
 * @param {object} message - The message object to save.
 * @returns {Promise<object>} The saved message object.
 */
export async function saveMessage(message) {
    const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();

    if (error) {
        console.error('Error saving message:', error);
        throw new Error('Failed to save message.');
    }
    return data;
}

/**
 * Updates the title of a conversation.
 * @param {string} conversationId - The ID of the conversation.
 * @param {string} title - The new title.
 */
export async function updateConversationTitle(conversationId, title) {
    const { error } = await supabase
        .from('conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    if (error) {
        console.error('Error updating conversation title:', error);
        // Not throwing here as it's not critical for the main flow
    }
}

/**
 * Fetches a dataset by its conversation ID.
 * @param {string} conversationId - The ID of the conversation.
 * @returns {Promise<object>} The dataset object.
 */
export async function getDatasetByConversationId(conversationId) {
    const { data, error } = await supabase
        .from('datasets').select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data;
}

/**
 * Fetches all conversations, ordered by last updated.
 * @returns {Promise<Array<object>>} A list of conversations.
 */
export async function getConversations() {
    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Creates a new conversation.
 * @returns {Promise<object>} The new conversation object.
 */
export async function createConversation() {
    const userId = 'demo-user-id'; // This will be dynamic after authentication is added
    const { data, error } = await supabase
        .from('conversations')
        .insert([
            {
                user_id: userId,
                title: 'New Conversation',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Deletes a conversation by its ID.
 * @param {string} id - The ID of the conversation to delete.
 */
export async function deleteConversation(id) {
    const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Fetches all messages for a conversation, ordered by creation date.
 * @param {string} conversationId - The ID of the conversation.
 * @returns {Promise<Array<object>>} A list of messages.
 */
export async function getMessages(conversationId) {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}


/**
 * Finds a conversation by ID, or creates a new one if it doesn't exist.
 * @param {string} conversationId - The ID of the conversation.
 * @returns {Promise<object>} The found or created conversation object.
 */
export async function findOrCreateConversation(conversationId) {
    // First, try to find the conversation
    const { data: existingConvo, error: findError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 = 'exact one row not found'
        console.error('Error finding conversation:', findError);
        throw new Error('Failed to find conversation.');
    }

    if (existingConvo) {
        return existingConvo; // Return the existing one
    }

    // If not found, create it
    const userId = 'demo-user-id'; // Placeholder
    const { data: newConvo, error: createError } = await supabase
        .from('conversations')
        .insert([
            {
                id: conversationId,
                user_id: userId,
                title: 'New Uploaded File Conversation',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ])
        .select()
        .single();

    if (createError) {
        console.error('Error creating conversation:', createError);
        throw new Error('Failed to create conversation.');
    }

    return newConvo;
}




/**
 * Creates a new dataset record in the database.
 * @param {object} datasetData - The data for the new dataset.
 * @returns {Promise<object>} The created dataset object.
 */
export async function createDataset(datasetData) {
    const { data, error } = await supabase
        .from('datasets')
        .insert([datasetData])
        .select()
        .single();

    if (error) {
        console.error('Error creating dataset:', error);
        throw new Error('Failed to create dataset.');
    }

    return data;
}