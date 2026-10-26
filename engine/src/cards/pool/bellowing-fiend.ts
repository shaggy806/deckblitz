import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 30808.
//
// Any damage it deals to a creature, combat or not, once per creature dealt
// damage (`deals-damage` with a recipient named). "That creature's
// controller" is the `"trigger-player"` — a permanent recipient's
// controller; if that's you, you're dealt both 3s.

const TEXT =
  "Whenever this creature deals damage to a creature, this creature deals 3 damage to that creature's controller and 3 damage to you.";

export default defineCard({
  name: "Bellowing Fiend",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 3, who: "trigger-player" },
          { kind: "damage", amount: 3, who: "you" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
