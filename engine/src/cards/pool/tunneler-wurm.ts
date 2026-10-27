import { defineCard } from "../define.js";

// Judgment (JUD). EDHREC rank 28669.

const TEXT = "Discard a card: Regenerate this creature.";

export default defineCard({
  name: "Tunneler Wurm",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 6,
  toughness: 6,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
