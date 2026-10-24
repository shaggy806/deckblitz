import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// Rulings:
//   [2016-01-22] Support can target a creature you don't control.
//   [2016-01-22] You can't put more than one +1/+1 counter on any one target using the support
//     action.

export default defineCard({
  name: "Shoulder to Shoulder",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Support 2. (Put a +1/+1 counter on each of up to two target creatures.)\nDraw a card.",
  // Support N on an instant or sorcery: "each of up to N target creatures"
  // (rule 701.41a) — no "other".
  targets: distinctTargets(2, "creature", { optional: true }),
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
});
