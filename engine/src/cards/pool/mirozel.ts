import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] Triggers on a spell or ability being changed to target this card.
//   [2004-10-04] Triggers on any spell or ability being announced which targets this card. This
//     means it returns to owner’s hand before that spell resolves.

const TARGET_TEXT =
  "When this creature becomes the target of a spell or ability, return this creature to its owner's hand.";

export default defineCard({
  name: "Mirozel",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TARGET_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: TARGET_TEXT,
    },
  ],
});
