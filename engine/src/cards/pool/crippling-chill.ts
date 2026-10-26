import { defineCard } from "../define.js";

// Magic 2013 (M13). EDHREC rank 19973. Take into Custody plus a draw.
//
// Rulings:
//   [2011-09-22] Crippling Chill can target a creature that’s already tapped. It still won’t untap
//     during its controller’s next untap step.

export default defineCard({
  name: "Crippling Chill",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap target creature. It doesn't untap during its controller's next untap step.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0, doesntUntapNext: true },
      { kind: "draw", amount: 1 },
    ],
  },
});
