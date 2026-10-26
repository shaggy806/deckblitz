import { defineCard } from "../define.js";

// Portal. EDHREC rank 9522.
//
// Each player picks how many to discard (0 is fine — the rulings), then each
// draws as many as they themselves discarded; then the caster draws one more.
export default defineCard({
  name: "Flux",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Each player discards any number of cards, then draws that many cards.\nDraw a card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "each-player", amount: 0, anyNumber: true },
      { kind: "draw", who: "each-player", amount: { thisWay: "discarded", who: "each" } },
      { kind: "draw", amount: 1 },
    ],
  },
});
