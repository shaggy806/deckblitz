import { defineCard } from "../define.js";

const PLUS =
  "If an instant or sorcery source you control would deal damage to a permanent or player, it deals that much damage plus 2 to that permanent or player instead.";
const DISCARD = "At the beginning of each end step, discard your hand.";

export default defineCard({
  name: "Pyromancer's Swath",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${PLUS}\n${DISCARD}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        plus: 2,
        source: { typesAnyOf: ["instant", "sorcery"], controlledBy: "you" },
      },
      text: PLUS,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "discard-hand", who: "you" },
      resolve: null,
      text: DISCARD,
    },
  ],
});
