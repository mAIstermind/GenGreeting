export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  thumbnail: string;
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: 'unfocused_audience',
    name: 'Unfocused Audience',
    description: 'A humorous cartoon about getting attention in a distracted office.',
    template: `An exaggerated, cartoon-style illustration of a modern office meeting. All audience members are engrossed in their glowing smartphones, completely ignoring the presenter. The presenter holds up a large sign with bold, eye-catching letters that says: "Did this get your attention, \${firstName}?". The style is colorful and humorous.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3crect x='35' y='20' width='30' height='60' rx='5' fill='%234b5563'/%3e%3crect x='38' y='25' width='24' height='45' fill='%23818cf8'/%3e%3ccircle cx='50' cy='75' r='3' fill='%234b5563'/%3e%3c/svg%3e`,
  },
  {
    id: 'hidden_value',
    name: 'Hidden Value',
    description: 'A photorealistic image implying value is being overlooked.',
    template: `A photorealistic image of a sleek, modern office waste paper bin. Inside, nestled amongst crumpled papers, is a gleaming, 24-karat gold bar catching the light. The text "Did I get your attention, \${firstName}?" is elegantly written in a clean, sans-serif font at the bottom of the image.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3crect x='25' y='40' width='50' height='20' fill='%23facc15' stroke='%23fde047' stroke-width='2'/%3e%3c/svg%3e`,
  },
  {
    id: 'missed_opportunity',
    name: 'Missed Opportunity',
    description: 'A stylish desk scene showing an overlooked winning lottery ticket.',
    template: `A top-down view of a cluttered but stylish office desk. Among the papers, pens, and a coffee mug, lies a clearly visible winning lottery ticket for a massive jackpot. The text "Some opportunities are easy to miss. Did this get your attention, \${firstName}?" is artfully integrated into the scene.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3crect x='25' y='35' width='50' height='30' fill='white' rx='2'/%3e%3cpath d='M30 45h40 M30 55h40 M30 65h20' stroke='%239ca3af' stroke-width='3'/%3e%3ccircle cx='65' cy='65' r='8' fill='%2334d399'/%3e%3c/svg%3e`,
  },
  {
    id: 'office_llama',
    name: 'The Office Llama',
    description: 'A surreal and unexpected image of a llama in a boardroom.',
    template: `A surreal, high-detail illustration of a sophisticated corporate boardroom. In the middle of the room, standing calmly, is a well-groomed llama wearing a business tie. The text "Probably not what you were expecting. Did I get your attention, \${firstName}?" is written on a whiteboard in the background.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M50 25 C 55 20, 65 20, 70 25 L 70 60 C 70 70, 60 80, 50 80 C 40 80, 30 70, 30 60 L 30 25 C 35 20, 45 20, 50 25 Z' fill='%23e5e7eb'/%3e%3cpath d='M45 40h-5 M60 40h-5' stroke='black' stroke-width='3'/%3e%3cpath d='M45 55 A 5 5 0 0 1 55 55' fill='none' stroke='black' stroke-width='3'/%3e%3c/svg%3e`,
  },
  {
    id: 'standing_out',
    name: 'Standing Out',
    description: 'A minimalist scene about being different from the crowd.',
    template: `A minimalist scene showing hundreds of plain, white paper airplanes all flying in one direction. One single, brightly colored red paper airplane is flying in the opposite direction, creating a strong visual contrast. The text "It's tough to stand out. Did this get your attention, \${firstName}?" is placed in the empty space.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M20 30l30 0l-10 10' fill='white'/%3e%3cpath d='M30 50l30 0l-10 10' fill='white'/%3e%3cpath d='M80 70l-30 0l10 -10' fill='%23ef4444'/%3e%3c/svg%3e`,
  },
  {
    id: 'holiday_sparkle',
    name: 'Holiday Sparkle',
    description: 'A heartwarming and magical holiday scene with twinkling lights.',
    template: `A beautiful and heartwarming holiday scene. The main subject is surrounded by twinkling fairy lights, casting a warm, magical glow. Add the text "Wishing you a sparkling holiday season, \${firstName}!" in an elegant script font.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z' fill='%23fde047'/%3e%3c/svg%3e`,
  },
  {
    id: 'winter_wonderland',
    name: 'Winter Wonderland',
    description: 'A serene and peaceful winter landscape with falling snow.',
    template: `A serene winter landscape with gently falling snow covering pine trees. In the foreground, there's a cozy wooden sign with the text "Warm wishes this winter, \${firstName}!". The overall mood is peaceful and magical.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M50 20 L55 35 L70 40 L55 45 L50 60 L45 45 L30 40 L45 35 Z' fill='white'/%3e%3cpath d='M50 50 L53 60 L63 63 L53 66 L50 76 L47 66 L37 63 L47 60 Z' fill='white'/%3e%3cpath d='M30 25 L33 35 L43 38 L33 41 L30 51 L27 41 L17 38 L27 35 Z' fill='white'/%3e%3cpath d='M70 55 L73 65 L83 68 L73 71 L70 81 L67 71 L57 68 L67 65 Z' fill='white'/%3e%3c/svg%3e`,
  },
  {
    id: 'birthday_confetti',
    name: 'Birthday Confetti',
    description: 'A vibrant, joyful, and celebratory birthday scene.',
    template: `An explosion of colorful confetti raining down. In the center, a beautifully wrapped gift box with a tag that reads "Happy Birthday, \${firstName}!". The style is vibrant, joyful, and celebratory.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3ccircle cx='20' cy='30' r='5' fill='%23ec4899'/%3e%3ccircle cx='80' cy='25' r='5' fill='%238b5cf6'/%3e%3ccircle cx='50' cy='20' r='5' fill='%2334d399'/%3e%3crect x='30' y='40' width='40' height='40' fill='%2360a5fa'/%3e%3crect x='25' y='58' width='50' height='5' fill='%23ef4444'/%3e%3c/svg%3e`,
  },
  {
    id: 'elegant_floral_frame',
    name: 'Elegant Floral Frame',
    description: 'An artistic and beautiful watercolor flower design.',
    template: `An artistic image of a beautiful bouquet of watercolor flowers. The entire image is enclosed within a delicate, elegant floral frame. In the center, elegantly write the text "A note for you, \${firstName}!".`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3ccircle cx='50' cy='50' r='20' fill='%23fb7185'/%3e%3ccircle cx='50' cy='50' r='10' fill='%23fde047'/%3e%3c/svg%3e`,
  },
  {
    id: 'festive_celebration',
    name: 'Festive Celebration',
    description: 'An exciting and happy scene with glowing sparklers.',
    template: `A festive and vibrant scene with glowing sparklers creating beautiful light trails against a twilight sky. The text "Time to celebrate, \${firstName}!" is written in a fun, celebratory font. The mood is exciting and happy.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M50 50 L50 20 M50 50 L20 50 M50 50 L80 50 M50 50 L50 80 M50 50 L30 30 M50 50 L70 70 M50 50 L70 30 M50 50 L30 70' stroke='%23facc15' stroke-width='3'/%3e%3c/svg%3e`,
  },
  {
    id: 'email_signature',
    name: 'Email Signature',
    description: 'A clean and professional signature image with name and email.',
    template: `Create a professional and stylish email signature image. It should prominently feature the name "\${firstName}". Also, subtly and elegantly, include the email address "\${email}". The design should be clean, modern, and suitable for a business context. Do not include any other text besides the name and email.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3ccircle cx='50' cy='50' r='20' stroke='white' stroke-width='5' fill='none'/%3e%3ctext x='50' y='62' font-size='30' fill='white' text-anchor='middle' font-family='Arial'%3e@%3c/text%3e%3c/svg%3e`,
  }
];

export const defaultPromptTemplate = promptTemplates[0];