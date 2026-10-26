import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 13155. The entering creature's controller
// chooses what to sacrifice as this resolves — the new creature itself
// included, which is all they may have (the rulings).

const TEXT = "Whenever a creature enters, its controller sacrifices a creature or land of their choice.";

export default defineCard({
  name: "Tainted Aether",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "trigger-controller",
        filter: { typesAnyOf: ["creature", "land"] },
        count: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
