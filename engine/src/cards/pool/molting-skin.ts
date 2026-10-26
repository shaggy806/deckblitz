import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 22647. Broken Fall's ability: returning itself is the
// cost.

const TEXT = "Return this enchantment to its owner's hand: Regenerate target creature.";

export default defineCard({
  name: "Molting Skin",
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
