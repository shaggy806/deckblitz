import { defineCard } from "../define.js";

// Back face of Jetfire, Ingenious Scientist. Adapt 3 (rule 701.46a) is
// Incubation Druid's shape, on the face Jetfire has converted to.

const ADAPT_TEXT =
  "{U}{U}{U}: Convert Jetfire, then adapt 3. (If it has no +1/+1 counters on it, put three +1/+1 counters on it.)";

export default defineCard({
  name: "Jetfire, Air Guardian",
  art: "https://cards.scryfall.io/art_crop/back/6/b/6bf61883-2343-4a9f-9a34-99326a8827ad.jpg",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Living metal (During your turn, this Vehicle is also a creature.)\nFlying\n${ADAPT_TEXT}`,
  static: [
    { affects: { scope: "self" }, condition: { kind: "your-turn" }, addTypes: ["creature"], text: "Living metal" },
  ],
  activated: [
    {
      cost: { mana: "{U}{U}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "transform", target: "source" },
          { kind: "adapt", amount: 3 },
        ],
      },
      resolve: null,
      text: ADAPT_TEXT,
    },
  ],
  faces: ["Jetfire, Ingenious Scientist", "Jetfire, Air Guardian"],
  transform: true,
});
