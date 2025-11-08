
export interface Contact {
  name: string;
  email: string;
  customPromptDetail?: string;
}

export interface GeneratedCard extends Contact {
  imageUrl: string;
}