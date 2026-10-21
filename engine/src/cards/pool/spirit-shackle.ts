import { defineCard } from "../define.js";

// EDHREC rank 30253.
//
// Rulings:
//   [2004-10-04] Spirit Shackle's ability triggers only when the enchanted creature changes
//     from untapped to tapped. If Spirit Shackle enters attached to an already tapped
//     creature, it won't do anything (until that creature untaps and becomes tapped again,
//     that is).

const TEXT = "Whenever enchanted creature becomes tapped, put a -0/-2 counter on it.";

export default defineCard({
  name: "Spirit Shackle",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "-0/-2", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
