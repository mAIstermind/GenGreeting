export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: 'unfocused_audience',
    name: 'Unfocused Audience',
    template: `An exaggerated, cartoon-style illustration of a modern office meeting. All audience members are engrossed in their glowing smartphones, completely ignoring the presenter. The presenter holds up a large sign with bold, eye-catching letters that says: "Did this get your attention, \${firstName}?". The style is colorful and humorous.`,
  },
  {
    id: 'hidden_value',
    name: 'Hidden Value',
    template: `A photorealistic image of a sleek, modern office waste paper bin. Inside, nestled amongst crumpled papers, is a gleaming, 24-karat gold bar catching the light. The text "Did I get your attention, \${firstName}?" is elegantly written in a clean, sans-serif font at the bottom of the image.`,
  },
  {
    id: 'missed_opportunity',
    name: 'Missed Opportunity',
    template: `A top-down view of a cluttered but stylish office desk. Among the papers, pens, and a coffee mug, lies a clearly visible winning lottery ticket for a massive jackpot. The text "Some opportunities are easy to miss. Did this get your attention, \${firstName}?" is artfully integrated into the scene.`,
  },
  {
    id: 'office_llama',
    name: 'The Office Llama',
    template: `A surreal, high-detail illustration of a sophisticated corporate boardroom. In the middle of the room, standing calmly, is a well-groomed llama wearing a business tie. The text "Probably not what you were expecting. Did I get your attention, \${firstName}?" is written on a whiteboard in the background.`,
  },
  {
    id: 'standing_out',
    name: 'Standing Out',
    template: `A minimalist scene showing hundreds of plain, white paper airplanes all flying in one direction. One single, brightly colored red paper airplane is flying in the opposite direction, creating a strong visual contrast. The text "It's tough to stand out. Did this get your attention, \${firstName}?" is placed in the empty space.`,
  },
  {
    id: 'holiday_sparkle',
    name: 'Holiday Sparkle',
    template: `A beautiful and heartwarming holiday scene. The main subject is surrounded by twinkling fairy lights, casting a warm, magical glow. Add the text "Wishing you a sparkling holiday season, \${firstName}!" in an elegant script font.`
  },
  {
    id: 'winter_wonderland',
    name: 'Winter Wonderland',
    template: `A serene winter landscape with gently falling snow covering pine trees. In the foreground, there's a cozy wooden sign with the text "Warm wishes this winter, \${firstName}!". The overall mood is peaceful and magical.`
  },
  {
    id: 'birthday_confetti',
    name: 'Birthday Confetti',
    template: `An explosion of colorful confetti raining down. In the center, a beautifully wrapped gift box with a tag that reads "Happy Birthday, \${firstName}!". The style is vibrant, joyful, and celebratory.`
  },
  {
    id: 'elegant_floral_frame',
    name: 'Elegant Floral Frame',
    template: `An artistic image of a beautiful bouquet of watercolor flowers. The entire image is enclosed within a delicate, elegant floral frame. In the center, elegantly write the text "A note for you, \${firstName}!".`
  },
  {
    id: 'festive_celebration',
    name: 'Festive Celebration',
    template: `A festive and vibrant scene with glowing sparklers creating beautiful light trails against a twilight sky. The text "Time to celebrate, \${firstName}!" is written in a fun, celebratory font. The mood is exciting and happy.`
  }
];

export const defaultPromptTemplate = promptTemplates[0];