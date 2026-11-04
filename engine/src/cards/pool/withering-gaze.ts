import { defineCard } from "../define.js";

// "Each Forest and green card" is one per card that's either: Dryad Arbor
// counts once (`anyOf`, not a sum of the two counts).
export default defineCard({
  name: "Withering Gaze",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You draw a card for each Forest and green card in it.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-hand", who: 0 },
      {
        kind: "draw",
        amount: { thisWay: "revealed", filter: { anyOf: [{ subtype: "Forest" }, { colors: ["G"] }] } },
      },
    ],
  },
});
