export interface Category {
    cat_id: number;
    cat_color_id: string;
    cat_title: string;
    cat_description: string;
    cat_background: string;
    cat_foreground: string;
    cat_active: boolean;
    cat_event_prefix: string;
    cat_examples: string[]
}

export interface CategoryCard {
    category: Category;
    onSave: (updatedCategory: Category) => void;
}

export interface ToolCall {
    id: string;
    function: {
        arguments: string;
        name: string;
    };
    type: string;
}

export interface ToolCallResult {
    tool_call_id: string
    content: string
    status?: "success" | "error"
}

export type MessageRole = "system" | "user" | "assistant" | "tool"
export interface ConversationMessage {
    role: MessageRole
    content: string
    tool_calls?: ToolCall[]
    tool_call_id?: string
    tool_call_result?: ToolCallResult
}

export interface ConversationMessages {
    conversationId: number;
    message: ConversationMessage[]
}

export interface History {
    name: string
    url: string
    id: number
    date: string
    isToday: boolean
}

export interface ConversationHeader {
    c_id: number
    c_name: string
    c_created_at: string
    c_deleted: boolean
}

export interface Path {
    displayName: string
    reference: string
}  
