import { defineCard } from "../define.js";

// EDHREC rank 1953.
//
// Compulsive Research's "discard two cards unless you discard a [kind] card"
// (`unlessOne`): one artifact card is a whole answer, or any two cards —
// two artifacts if you like (the ruling).
const TEXT = "Draw three cards. Then discard two cards unless you discard an artifact card.";

export default defineCard({
  name: "Thirst for Knowledge",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "discard", target: "you", amount: 2, unlessOne: { type: "artifact" } },
    ],
  },
});
