import { defineCard } from "../define.js";

// EDHREC rank 25446. Inspired with Ghostly Pilferer's "you may pay".
const INSPIRED_TEXT =
  "Inspired — Whenever this creature becomes untapped, you may pay {2}{U}. If you do, create a 2/2 blue Bird enchantment creature token with flying.";

export default defineCard({
  name: "Aerie Worshippers",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 4,
  text: INSPIRED_TEXT,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{U} to create a 2/2 Bird token?",
        cost: "{2}{U}",
        effect: { kind: "create-token", token: "2/2 Blue Enchantment Bird Token (Flying)", count: 1 },
      },
      resolve: null,
      text: INSPIRED_TEXT,
    },
  ],
});
