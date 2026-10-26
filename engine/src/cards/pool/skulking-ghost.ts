import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 30834.
//
// Frost Walker's trigger: it resolves first, so a spell with no other target
// then has none legal and doesn't resolve (the rulings).

const TEXT = "When this creature becomes the target of a spell or ability, sacrifice it.";

export default defineCard({
  name: "Skulking Ghost",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
