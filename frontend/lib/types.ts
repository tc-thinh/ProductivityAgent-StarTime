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
