import { defineCard } from "../define.js";

// EDHREC rank 23799. Inspired with Ghostly Pilferer's "you may pay": the cost
// is decided as the trigger resolves (its ruling).
const INSPIRED_TEXT =
  "Inspired — Whenever this creature becomes untapped, you may pay {2}{R}. If you do, create a 3/1 red Elemental enchantment creature token with haste.";

export default defineCard({
  name: "Satyr Nyx-Smith",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Satyr", "Shaman"],
  power: 2,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${INSPIRED_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{R} to create a 3/1 Elemental token?",
        cost: "{2}{R}",
        effect: { kind: "create-token", token: "3/1 Red Enchantment Elemental Token (Haste)", count: 1 },
      },
      resolve: null,
      text: INSPIRED_TEXT,
    },
  ],
});
