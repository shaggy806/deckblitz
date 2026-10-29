import { defineCard } from "../define.js";

// EDHREC rank 3618.
//
// Grindstone's process with the pair also nonland: it repeats while both
// cards a pass mills are nonland and share a color (the rulings; colorless
// shares none).

const TRIGGER =
  "Whenever you draw a card, target opponent mills two cards. If two nonland cards that share a color were milled this way, repeat this process.";
const LOOT = "{5}{U}: Draw a card, then discard a card.";

export default defineCard({
  name: "Sphinx's Tutelage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${TRIGGER}\n${LOOT}`,
  activated: [
    {
      cost: { mana: "{5}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT,
    },
  ],
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "repeat",
        effect: { kind: "mill", target: 0, amount: 2 },
        again: { kind: "this-way", what: "milled", filter: { notTypes: ["land"] }, sharing: "color", atLeast: 2 },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
