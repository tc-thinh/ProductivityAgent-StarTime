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

export interface ConversationMessage {
    role: string;
    content: string;
}

export interface ToolCallMessage {
    role: string;
    content: string;
    tool_calls: ToolCall[];
}

export interface ToolCallResult {
    role: string;
    tool_call_id: string;
    content: string;
}

export interface ConversationMessages {
    conversationId: number;
    message: (ConversationMessage | ToolCallMessage | ToolCallResult)[]
}
