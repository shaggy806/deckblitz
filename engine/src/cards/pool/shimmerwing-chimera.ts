import { defineCard } from "../define.js";

// Theros Beyond Death.

const UPKEEP = "At the beginning of your upkeep, return up to one other target enchantment you control to its owner's hand.";

export default defineCard({
  name: "Shimmerwing Chimera",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Chimera"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [
        { kind: "optional", of: { kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "enchantment" } } } },
      ],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
