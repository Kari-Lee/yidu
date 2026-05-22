// Five Elements (Wu Xing) system for overseas version
// Relationships: 相生 (generating) and 相克 (overcoming)

export const ELEMENTS = {
  木: {
    en: "Wood",
    symbol: "木",
    emoji: "🌿",
    color: "#4A7C59",
    gradient: "linear-gradient(135deg, #2D5A3D, #6B9B7A)",
    bg: "#1A2F22",
    traits: ["Growth-oriented", "Flexible but resilient", "Deeply empathetic", "Restless energy"],
    loveStyle: "You love by growing alongside someone. You need space to stretch, but your roots run deep. When you commit, you intertwine your entire life with theirs.",
    shadow: "You avoid confrontation until you snap like a branch. You confuse independence with emotional unavailability.",
  },
  火: {
    en: "Fire",
    symbol: "火",
    emoji: "🔥",
    color: "#C75B3A",
    gradient: "linear-gradient(135deg, #8B2E16, #D4724A)",
    bg: "#2A1510",
    traits: ["Passionate & intense", "Quick to ignite", "Magnetic presence", "Burns bright, burns fast"],
    loveStyle: "You love like a wildfire — consuming, illuminating, impossible to ignore. You make people feel alive. The problem is you sometimes burn through relationships the same way.",
    shadow: "You mistake intensity for intimacy. When the spark fades, you assume the love is gone — but maybe you just need to learn to tend embers.",
  },
  土: {
    en: "Earth",
    symbol: "土",
    emoji: "🏔",
    color: "#A08050",
    gradient: "linear-gradient(135deg, #6B5535, #C4A06A)",
    bg: "#231E15",
    traits: ["Grounded & stable", "Nurturing by nature", "Overthinks everything", "Loyal to a fault"],
    loveStyle: "You are the person people come home to. Steady, warm, endlessly patient. You build love like you build anything — brick by brick, with care.",
    shadow: "You give and give until you resent the giving. You confuse being needed with being loved.",
  },
  金: {
    en: "Metal",
    symbol: "金",
    emoji: "⚔️",
    color: "#8A8A8A",
    gradient: "linear-gradient(135deg, #4A4A4A, #A0A0A0)",
    bg: "#1A1A1E",
    traits: ["Sharp-minded", "High standards", "Emotionally guarded", "Values structure"],
    loveStyle: "You love precisely. You know exactly what you want and refuse to settle. When you let someone in, it means something — because you don't let just anyone past your walls.",
    shadow: "Your standards are so high they become a wall. You cut people off cleanly when they disappoint you, and you call it self-respect.",
  },
  水: {
    en: "Water",
    symbol: "水",
    emoji: "🌊",
    color: "#4A6FA5",
    gradient: "linear-gradient(135deg, #1E3A5F, #6B8FC4)",
    bg: "#121D2A",
    traits: ["Deeply intuitive", "Emotionally fluid", "Mysterious depth", "Adapts to everything"],
    loveStyle: "You feel everything. You absorb your partner's emotions like a sponge. You love by understanding — sometimes you know what they need before they do.",
    shadow: "You lose yourself in other people. You're so busy reading their emotions that you forget to check your own.",
  },
};

// 相生 Generating cycle: Wood → Fire → Earth → Metal → Water → Wood
export const SHENG = {
  木: "火", 火: "土", 土: "金", 金: "水", 水: "木",
};
export const SHENG_DESC = {
  "木→火": { en: "Wood feeds Fire", desc: "You fuel their passion. They light up around you. This is the relationship where you both become more alive — but be careful you don't burn yourself out keeping their flame going." },
  "火→土": { en: "Fire creates Earth", desc: "Your intensity grounds into something lasting through them. They take your chaotic energy and turn it into something stable, real, buildable." },
  "土→金": { en: "Earth produces Metal", desc: "Your steadiness gives them the foundation to be their sharpest self. You believe in them so consistently that they start believing in themselves." },
  "金→水": { en: "Metal collects Water", desc: "Your clarity gives shape to their emotional depth. Without you, they'd overflow. With you, their feelings find direction." },
  "水→木": { en: "Water nourishes Wood", desc: "Your emotional intelligence feeds their growth. You understand them in ways nobody else does. This is quiet love — the kind that shows up every day." },
};

// 相克 Overcoming cycle: Wood → Earth → Water → Fire → Metal → Wood
export const KE = {
  木: "土", 土: "水", 水: "火", 火: "金", 金: "木",
};
export const KE_DESC = {
  "木→土": { en: "Wood penetrates Earth", desc: "You destabilize them. Your need for growth uproots their need for stability. They feel like they can never settle down when you're around." },
  "土→水": { en: "Earth absorbs Water", desc: "You contain them until they feel suffocated. Your need for control dams up their emotional flow. They feel trapped." },
  "水→火": { en: "Water extinguishes Fire", desc: "You cool their passion. Your emotional heaviness puts out their spark. They start dimming themselves to match your energy." },
  "火→金": { en: "Fire melts Metal", desc: "Your intensity overwhelms their structure. You're so much that their carefully built walls collapse — and not always in a good way." },
  "金→木": { en: "Metal chops Wood", desc: "Your criticism cuts their growth short. Every time they try to expand, you prune them back. You call it realism. They call it suffocating." },
};

// Same element
export const SAME_DESC = {
  木: "Two Woods tangled together — growing in the same direction, fighting for the same sunlight. Beautiful and competitive.",
  火: "Two Fires. Twice the heat, twice the passion, twice the chance of burning the whole thing down. Spectacular while it lasts.",
  土: "Two Earths. So stable it might actually get boring. You'll build a beautiful life and forget to live in it.",
  金: "Two Metals. Both sharp, both proud, both refusing to bend first. Respect is high. Warmth is... being negotiated.",
  水: "Two Waters. You understand each other on a level that's almost telepathic. The danger is drowning in each other's emotions.",
};

// Chinese zodiac data for overseas
export const ZODIAC = [
  { zh: "鼠", en: "Rat", emoji: "🐀", years: "1984, 1996, 2008, 2020" },
  { zh: "牛", en: "Ox", emoji: "🐂", years: "1985, 1997, 2009, 2021" },
  { zh: "虎", en: "Tiger", emoji: "🐅", years: "1986, 1998, 2010, 2022" },
  { zh: "兔", en: "Rabbit", emoji: "🐇", years: "1987, 1999, 2011, 2023" },
  { zh: "龙", en: "Dragon", emoji: "🐉", years: "1988, 2000, 2012, 2024" },
  { zh: "蛇", en: "Snake", emoji: "🐍", years: "1989, 2001, 2013, 2025" },
  { zh: "马", en: "Horse", emoji: "🐎", years: "1990, 2002, 2014, 2026" },
  { zh: "羊", en: "Goat", emoji: "🐐", years: "1991, 2003, 2015, 2027" },
  { zh: "猴", en: "Monkey", emoji: "🐒", years: "1992, 2004, 2016, 2028" },
  { zh: "鸡", en: "Rooster", emoji: "🐓", years: "1993, 2005, 2017, 2029" },
  { zh: "狗", en: "Dog", emoji: "🐕", years: "1994, 2006, 2018, 2030" },
  { zh: "猪", en: "Pig", emoji: "🐖", years: "1995, 2007, 2019, 2031" },
];

// 六冲 (Six Clashes) - the most toxic combos
export const TOXIC_COMBOS = [
  { a: 0, b: 6, level: "☠️", label: "CATASTROPHIC", title: "Rat × Horse", desc: "The classic control-freak meets free-spirit collision. Rat wants to plan everything. Horse wants to burn the plan and run. You'll have explosive chemistry and even more explosive arguments. The makeup sex is legendary. The breakup texts are novels.", advice: "If you're in this: stop trying to change each other. That's not love, that's a renovation project." },
  { a: 1, b: 7, level: "☠️", label: "CATASTROPHIC", title: "Ox × Goat", desc: "Ox builds a fortress of routine. Goat fills it with chaos and art supplies. Ox calls Goat irresponsible. Goat calls Ox boring. Both are right. Neither will admit the other has a point.", advice: "The Ox needs to learn that not everything needs a spreadsheet. The Goat needs to learn that some things do." },
  { a: 2, b: 8, level: "💀", label: "VOLATILE", title: "Tiger × Monkey", desc: "Two alpha energies in one relationship. Tiger is raw power. Monkey is cunning strategy. They both think they're in charge. Nobody is in charge. It's anarchy with occasional tenderness.", advice: "This works ONLY if you both find each other's power attractive instead of threatening." },
  { a: 3, b: 9, level: "💀", label: "VOLATILE", title: "Rabbit × Rooster", desc: "Rabbit is soft-spoken, indirect, reads the room. Rooster says exactly what they think, loudly, at dinner with your parents. Rabbit silently builds resentment. Rooster has no idea anything is wrong until Rabbit vanishes.", advice: "Rooster: ask before you 'fix' things. Rabbit: open your mouth before it's too late." },
  { a: 4, b: 10, level: "🔥", label: "INTENSE", title: "Dragon × Dog", desc: "Dragon demands to be admired. Dog demands to be trusted. Dragon's grand gestures feel performative to Dog. Dog's loyalty feels boring to Dragon. It's a fundamental disagreement about what love should look like.", advice: "Dragon needs to understand that quiet devotion IS love. Dog needs to let Dragon shine without feeling threatened." },
  { a: 5, b: 11, level: "🔥", label: "INTENSE", title: "Snake × Pig", desc: "Snake is private, calculating, plays 4D chess with emotions. Pig is open, generous, wears their heart on their sleeve. Snake finds Pig naive. Pig finds Snake exhausting. The irony? They're both deeply emotional — just in completely opposite ways.", advice: "Snake: vulnerability isn't weakness. Pig: not everyone who's guarded is hiding something bad." },
];

// 六合 (Six Harmonies) - the best combos
export const HARMONY_COMBOS = [
  { a: 0, b: 1, label: "SOULMATE ENERGY", title: "Rat × Ox", desc: "The strategist and the builder. Rat sees the opportunity, Ox makes it real. Low-drama, high-trust, annoyingly functional. Other couples hate you." },
  { a: 2, b: 11, label: "SOULMATE ENERGY", title: "Tiger × Pig", desc: "Tiger's boldness meets Pig's warmth. Tiger protects, Pig nurtures. It's the relationship where you both feel safe enough to be your messiest selves." },
  { a: 3, b: 10, label: "DEEP BOND", title: "Rabbit × Dog", desc: "Two of the most loyal signs. You build a world together and never want to leave it. Quiet love, deep roots, matching pajamas by month three." },
  { a: 4, b: 9, label: "POWER COUPLE", title: "Dragon × Rooster", desc: "Dragon's vision plus Rooster's execution. You look incredible together and you know it. The couple that walks into a room and everyone notices." },
  { a: 5, b: 8, label: "DEEP BOND", title: "Snake × Monkey", desc: "The intellectuals. You can talk for 12 hours straight and still have things to say. Mental connection so strong it becomes physical. Conversations that feel like foreplay." },
  { a: 6, b: 7, label: "NATURAL FIT", title: "Horse × Goat", desc: "Horse runs, Goat wanders, they always find their way back to each other. Freedom-loving but deeply attached. The relationship that feels like a road trip with no destination." },
];

export function getZodiacIndex(year) {
  return ((year - 4) % 12 + 12) % 12;
}

export function getElement(year, month, day) {
  const t = ((year - 4) % 10 + 10) % 10;
  const dd = Math.floor((Date.UTC(year, month - 1, day) / 86400000) + 10) % 60;
  const dayT = dd % 10;
  const wuxingMap = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"];
  const zhMap = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
  return { en: wuxingMap[dayT], zh: zhMap[dayT], yearEn: wuxingMap[t], yearZh: zhMap[t] };
}
