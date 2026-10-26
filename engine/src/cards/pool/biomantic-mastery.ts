import { defineCard } from "../define.js";

// Dissension. EDHREC rank 19804.
//
// Rulings:
//   [2006-05-01] You choose both targets before you draw any cards. The targets must be different.
//     One of them may be you.
//
// Each count is read as its own draw happens; a slot gone illegal counts 0.

export default defineCard({
  name: "Biomantic Mastery",
  manaCost: "{4}{G/U}{G/U}{G/U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: "Draw a card for each creature target player controls, then draw a card for each creature another target player controls.",
  targets: ["player", { kind: "other", of: "player", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: { countOf: { type: "creature", controlledBy: "you" }, forTarget: 0 } },
      { kind: "draw", amount: { countOf: { type: "creature", controlledBy: "you" }, forTarget: 1 } },
    ],
  },
});
