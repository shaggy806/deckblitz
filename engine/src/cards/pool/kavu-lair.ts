import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 18283. Any player's creature; the entering creature's
// controller draws (Tainted Aether's "its controller").

const TEXT = "Whenever a creature with power 4 or greater enters, its controller draws a card.";

export default defineCard({
  name: "Kavu Lair",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature", power: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "draw", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
