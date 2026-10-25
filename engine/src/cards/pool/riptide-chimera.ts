import { defineCard } from "../define.js";

const TEXT = "At the beginning of your upkeep, return an enchantment you control to its owner's hand.";

// Not targeted, and not optional: one enchantment you control is chosen as
// it resolves — the Chimera itself if it's the only one; nothing happens with
// none (the rulings).
export default defineCard({
  name: "Riptide Chimera",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Chimera"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of your upkeep, return an enchantment you control to its owner's hand.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "enchantment", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return an enchantment you control to its owner's hand",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
