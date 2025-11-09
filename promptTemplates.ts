

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  thumbnail: string;
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: 'initial_avatar',
    name: 'Personalized Initial Avatar',
    description: 'Creates a stylish, modern avatar featuring the first initial of the person\'s name. Great for generating personalized profile pictures in bulk.',
    template: `A minimalist and professional circular avatar. The design features the single letter "\${firstInitial}" in a bold, white, sans-serif font. The background of the circle is a vibrant gradient transitioning from deep blue to electric purple. The overall aesthetic is clean, modern, and eye-catching.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3ccircle cx='50' cy='50' r='40'%3e%3cdefs%3e%3clinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:%234f46e5;stop-opacity:1' /%3e%3cstop offset='100%25' style='stop-color:%23a855f7;stop-opacity:1' /%3e%3c/linearGradient%3e%3c/defs%3e%3c/circle%3e%3cpath d='M50 50' fill='url(%23grad)'/%3e%3ccircle cx='50' cy='50' r='40' fill='url(%23grad)'/%3e%3ctext x='50' y='68' font-size='50' fill='white' text-anchor='middle' font-family='Arial' font-weight='bold'%3eA%3c/text%3e%3c/svg%3e`,
  },
  {
    id: 'unfocused_audience',
    name: 'Unfocused Audience',
    description: 'A colorful, humorous cartoon of an office meeting where the audience is distracted by their phones. Perfect for a lighthearted way to grab attention.',
    template: `An exaggerated, cartoon-style illustration of a modern office meeting. All audience members are engrossed in their glowing smartphones, completely ignoring the presenter. The presenter holds up a large sign with bold, eye-catching letters that says: "Did this get your attention, \${firstName}?". The style is colorful and humorous.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M20 70 L 25 40 L 35 40 L 40 70 Z' fill='%234b5563'/%3e%3ccircle cx='30' cy='35' r='5' fill='%234b5563'/%3e%3crect x='28' y='50' width='8' height='12' fill='%23818cf8'/%3e%3cpath d='M40 70 L 45 40 L 55 40 L 60 70 Z' fill='%234b5563'/%3e%3ccircle cx='50' cy='35' r='5' fill='%234b5563'/%3e%3crect x='48' y='50' width='8' height='12' fill='%23818cf8'/%3e%3cpath d='M60 70 L 65 40 L 75 40 L 80 70 Z' fill='%234b5563'/%3e%3ccircle cx='70' cy='35' r='5' fill='%234b5563'/%3e%3crect x='68' y='50' width='8' height='12' fill='%23818cf8'/%3e%3c/svg%3e`,
  },
  {
    id: 'hidden_value',
    name: 'Hidden Value',
    description: 'A photorealistic image of a golden bar discarded in a waste bin, implying that value is often overlooked. A very high-impact visual.',
    template: `A photorealistic image of a sleek, modern office waste paper bin. Inside, nestled amongst crumpled papers, is a gleaming, 24-karat gold bar catching the light. The text "Did I get your attention, \${firstName}?" is elegantly written in a clean, sans-serif font at the bottom of the image.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M30 20 L 70 20 L 65 80 L 35 80 Z' fill='%234b5563'/%3e%3crect x='40' y='50' width='20' height='8' fill='%23facc15' stroke='%23fde047' stroke-width='1' transform='rotate(15 50 54)'/%3e%3c/svg%3e`,
  },
  {
    id: 'missed_opportunity',
    name: 'Missed Opportunity',
    description: 'A stylish, top-down desk scene showing a winning lottery ticket being ignored. Great for "don\'t miss this" messages.',
    template: `A top-down view of a cluttered but stylish office desk. Among the papers, pens, and a coffee mug, lies a clearly visible winning lottery ticket for a massive jackpot. The text "Some opportunities are easy to miss. Did this get your attention, \${firstName}?" is artfully integrated into the scene.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3crect x='20' y='20' width='60' height='60' fill='%23374151' rx='5'/%3e%3crect x='35' y='40' width='30' height='20' fill='white' rx='2'/%3e%3ccircle cx='50' cy='50' r='5' fill='%2334d399'/%3e%3c/svg%3e`,
  },
  {
    id: 'office_llama',
    name: 'The Office Llama',
    description: 'A surreal and memorable image of a full-sized llama wearing a tie in a corporate boardroom. Generates a "what is this?" moment.',
    template: `A surreal, high-detail illustration of a sophisticated corporate boardroom. In the middle of the room, standing calmly, is a well-groomed llama wearing a business tie. The text "Probably not what you were expecting. Did I get your attention, \${firstName}?" is written on a whiteboard in the background.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M40 80 V 40 C 40 20, 60 20, 60 40 V 80' fill='%23e5e7eb'/%3e%3cpath d='M50 35 C 55 30, 65 30, 70 35 L 70 25 C 65 15, 55 15, 50 25 Z' fill='%23e5e7eb'/%3e%3cpath d='M50 35 C 45 30, 35 30, 30 35 L 30 25 C 35 15, 45 15, 50 25 Z' fill='%23e5e7eb'/%3e%3cpath d='M48 60 L 52 60 L 50 75 Z' fill='%23ef4444'/%3e%3c/svg%3e`,
  },
  {
    id: 'standing_out',
    name: 'Standing Out',
    description: 'A minimalist scene showing hundreds of white paper airplanes, with a single red one flying the other way. A strong metaphor for being different.',
    template: `A minimalist scene showing hundreds of plain, white paper airplanes all flying in one direction. One single, brightly colored red paper airplane is flying in the opposite direction, creating a strong visual contrast. The text "It's tough to stand out. Did this get your attention, \${firstName}?" is placed in the empty space.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M20 30l20-10l-5 10' fill='white'/%3e%3cpath d='M25 50l20-10l-5 10' fill='white'/%3e%3cpath d='M30 70l20-10l-5 10' fill='white'/%3e%3cpath d='M80 50l-20 10l5-10' fill='%23ef4444'/%3e%3c/svg%3e`,
  },
  {
    id: 'office_birthday',
    name: 'Office Birthday Bash',
    description: 'A professional yet fun birthday card suitable for a colleague. Features office-related party elements.',
    template: `A stylish and professional birthday card illustration for an office setting. It features subtle, festive elements like balloons in corporate colors (blue, gray, white) and a cupcake with a single candle on a clean desk. The text 'Happy Birthday, \${firstName}!' is written in a modern, friendly font. The overall mood is celebratory but still appropriate for the workplace.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M35 80 L 65 80 L 65 70 C 65 60, 35 60, 35 70 Z' fill='%239ca3af'/%3e%3cpath d='M40 70 L 60 70 L 60 65 L 40 65 Z' fill='%23d1d5db'/%3e%3cpath d='M50 65 L 50 50' stroke='white' stroke-width='3'/%3e%3cpath d='M49 48 L 51 48 L 51 45 C 51 42, 49 42, 49 45 Z' fill='%23fde047'/%3e%3ccircle cx='30' cy='30' r='10' fill='%2360a5fa' stroke='white' stroke-width='1'/%3e%3cpath d='M30 40 L 30 50' stroke='%2360a5fa' stroke-width='1'/%3e%3c/svg%3e`,
  },
  {
    id: 'client_thank_you',
    name: 'Client Appreciation',
    description: 'A warm and professional thank you card. Features an elegant design to express gratitude to a client.',
    template: `An elegant and professional 'Thank You' card design. It features a warm, abstract background with sophisticated typography. The text 'Thank you for your partnership, \${firstName}!' is prominently displayed in a beautiful script font. The design should convey gratitude and appreciation in a business context.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M30 30 L 70 30 L 70 70 L 30 70 Z' fill='%23374151' stroke='white' stroke-width='1'/%3e%3cpath d='M35 40 L 65 40' stroke='%239ca3af' stroke-width='2'/%3e%3cpath d='M35 50 L 55 50' stroke='%239ca3af' stroke-width='2'/%3e%3cpath d='M35 60 L 60 60' stroke='%239ca3af' stroke-width='2'/%3e%3cpath d='M60 55 L 75 70 L 80 65 L 65 50 Z' fill='%23d1d5db'/%3e%3cpath d='M58 52 L 70 40 L 72 42 L 60 54 Z' fill='%233b82f6'/%3e%3c/svg%3e`,
  },
  {
    id: 'birthday_pop',
    name: 'Birthday Pop',
    description: 'A fun, pop-art style birthday card with vibrant colors, dynamic shapes, and an explosion of confetti.',
    template: `A vibrant pop-art style illustration celebrating a birthday. The background is an explosion of colorful confetti and graphic shapes. In bold, playful lettering, the text "Happy Birthday, \${firstName}!" takes center stage. The mood is energetic and fun.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M30 70 L 50 40 L 70 70 Z' fill='%23f472b6'/%3e%3crect x='48' y='30' width='4' height='10' fill='white'/%3e%3cpath d='M49 28 L 51 28 L 51 25 C 51 22, 49 22, 49 25 Z' fill='%23facc15'/%3e%3ccircle cx='25' cy='40' r='4' fill='%23a78bfa'/%3e%3ccircle cx='78' cy='50' r='5' fill='%2360a5fa'/%3e%3ccircle cx='40' cy='80' r='3' fill='%23fde047'/%3e%3c/svg%3e`,
  },
  {
    id: 'cozy_holiday',
    name: 'Cozy Holiday',
    description: 'A warm and rustic holiday card featuring hand-drawn elements like holly, pinecones, and a cozy fireplace scene.',
    template: `A cozy, rustic holiday greeting card. The scene is a warm fireplace with stockings hung. The border is decorated with hand-drawn style holly and pinecones. The text "Happy Holidays, \${firstName}!" is written in a friendly, handwritten font.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M50 20 C 30 30, 30 60, 50 70 C 70 60, 70 30, 50 20 Z' fill='%23166534'/%3e%3cpath d='M50 20 C 60 30, 60 60, 50 70' fill='%2315803d'/%3e%3ccircle cx='45' cy='75' r='6' fill='%23dc2626'/%3e%3ccircle cx='60' cy='70' r='6' fill='%23dc2626'/%3e%3ccircle cx='55' cy='85' r='6' fill='%23dc2626'/%3e%3c/svg%3e`,
  },
  {
    id: 'corporate_milestone',
    name: 'Corporate Milestone',
    description: 'An elegant and professional design celebrating a business anniversary. Features clean lines, a subtle color palette, and a touch of gold.',
    template: `An elegant and professional image to celebrate a business anniversary. The design features clean, abstract lines with a sophisticated color palette of navy blue, white, and a touch of gold foil. The text "Happy Anniversary, \${firstName}!" is written in a modern, sans-serif font.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M35 80 V 50 C 35 40, 65 40, 65 50 V 80' fill='%234b5563'/%3e%3cpath d='M50 50 V 20' stroke='%234b5563' stroke-width='10' stroke-linecap='round'/%3e%3cpath d='M30 25 C 20 35, 20 65, 30 75' stroke='%23facc15' stroke-width='5' fill='none'/%3e%3cpath d='M70 25 C 80 35, 80 65, 70 75' stroke='%23facc15' stroke-width='5' fill='none'/%3e%3ccircle cx='50' cy='20' r='10' fill='%23facc15'/%3e%3c/svg%3e`,
  },
  {
    id: 'career_ascent',
    name: 'Career Ascent',
    description: 'A modern, motivational image symbolizing a new career step. Great for "New Job" or "Promotion" congratulations on platforms like LinkedIn.',
    template: `A modern, motivational illustration for a career milestone. It depicts a stylized rocket launching towards the stars, symbolizing a new journey and success. The text "Congratulations on the new role, \${firstName}!" is placed in a clean, professional font.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M40 80 L 60 80 L 60 50 L 70 50 L 50 20 L 30 50 L 40 50 Z' fill='white'/%3e%3cpath d='M45 80 L 55 80 L 55 90 L 45 90 Z' fill='%233b82f6'/%3e%3cpath d='M40 70 C 20 90, 80 90, 60 70' stroke='%23f59e0b' stroke-width='5' fill='none'/%3e%3c/svg%3e`,
  },
  {
    id: 'elegant_floral_frame',
    name: 'Elegant Floral Frame',
    description: 'An artistic and beautiful watercolor flower design. Generates a delicate, high-end look suitable for thank you notes or formal announcements.',
    template: `An artistic image of a beautiful bouquet of watercolor flowers. The entire image is enclosed within a delicate, elegant floral frame. In the center, elegantly write the text "A note for you, \${firstName}!".`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3crect x='20' y='20' width='60' height='60' rx='30' fill='none' stroke='%23fb7185' stroke-width='5' stroke-dasharray='10 5'/%3e%3ccircle cx='50' cy='50' r='15' fill='%23fde047'/%3e%3c/svg%3e`,
  },
  {
    id: 'festive_celebration',
    name: 'Festive Celebration',
    description: 'An exciting and happy scene with glowing sparklers against a twilight sky. Great for New Year\'s, anniversaries, or celebrating a win.',
    template: `A festive and vibrant scene with glowing sparklers creating beautiful light trails against a twilight sky. The text "Time to celebrate, \${firstName}!" is written in a fun, celebratory font. The mood is exciting and happy.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3cpath d='M50 50 L80 20 M50 50 L20 20 M50 50 L20 80 M50 50 L80 80' stroke='%23facc15' stroke-width='3'/%3e%3ccircle cx='50' cy='50' r='5' fill='%23fde047'/%3e%3c/svg%3e`,
  },
  {
    id: 'email_signature',
    name: 'Email Signature',
    description: 'A clean, modern, and professional image featuring the recipient\'s name and email. Useful for creating personalized branding assets.',
    template: `Create a professional and stylish email signature image. It should prominently feature the name "\${firstName}". Also, subtly and elegantly, include the email address "\${email}". The design should be clean, modern, and suitable for a business context. Do not include any other text besides the name and email.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3crect x='25' y='35' width='50' height='2' fill='white'/%3e%3crect x='25' y='65' width='50' height='2' fill='white'/%3e%3ctext x='50' y='55' font-size='12' fill='white' text-anchor='middle' font-family='Arial'%3eSIGNATURE%3c/text%3e%3c/svg%3e`,
  },
  {
    id: 'welcome_banner',
    name: 'Personalized Welcome Banner',
    description: 'Creates a sleek, modern banner for welcome emails, featuring the contact\'s name and confirming their email address.',
    template: `Create a professional and clean welcome banner image suitable for an email header. The design should be modern and minimalist, with a cool color palette (blues, grays). The banner must prominently feature the text "Welcome Aboard, \${firstName}!". Below this main text, in a smaller, clean font, include the confirmation text: "Your access has been granted for \${email}". The overall aesthetic should be professional and welcoming, suitable for a SaaS product or online service. Do not include any other text.`,
    thumbnail: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231f2937'/%3e%3crect x='10' y='30' width='80' height='40' rx='5' fill='%23374151'/%3e%3cpath d='M10 40 Q 50 20, 90 40' stroke='%233b82f6' stroke-width='2' fill='none'/%3e%3ctext x='50' y='50' font-size='10' fill='white' text-anchor='middle' font-family='Arial' font-weight='bold'%3eWelcome!%3c/text%3e%3ctext x='50' y='62' font-size='6' fill='%23d1d5db' text-anchor='middle' font-family='Arial'%3eemail@example.com%3c/text%3e%3c/svg%3e`,
  }
];

// FIX: Export 'defaultPromptTemplate' to be used for default state in components.
export const defaultPromptTemplate = promptTemplates[0];