export interface Category {
    c_id: number;
    c_color_id: string;
    c_title: string;
    c_description: string;
    c_background: string;
    c_foreground: string;
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
