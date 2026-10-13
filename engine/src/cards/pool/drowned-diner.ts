import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// The right door of Meat Locker // Drowned Diner (meat-locker-drowned-diner.ts).
const UNLOCK = "When you unlock this door, draw three cards, then discard a card.";

export default defineCard({
  name: "Drowned Diner",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("right"),
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Meat Locker // Drowned Diner", "Meat Locker", "Drowned Diner"],
  split: true,
});
