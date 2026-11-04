import { defineCard } from "../define.js";

// "Each Mountain and red card" is one per card that's either: a red Mountain
// counts once (`anyOf`, not a sum of the two counts).
export default defineCard({
  name: "Baleful Stare",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You draw a card for each Mountain and red card in it.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-hand", who: 0 },
      {
        kind: "draw",
        amount: { thisWay: "revealed", filter: { anyOf: [{ subtype: "Mountain" }, { colors: ["R"] }] } },
      },
    ],
  },
});
