import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 19739. Returning itself is the cost
// (Ovinomancer's `returnSelfToHand`).

const TEXT = "Return this enchantment to its owner's hand: Regenerate target creature.";

export default defineCard({
  name: "Broken Fall",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, returnSelfToHand: true },
      targets: ["creature"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
