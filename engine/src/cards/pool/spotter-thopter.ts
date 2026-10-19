import { defineCard } from "../define.js";

// The Brothers' War. Prototype (rule 718): cast for {3}{U} it's a blue 2/3.
// X is its power as the trigger resolves, or as it last existed on the
// battlefield if it has left (the ruling) — `powerOf: "source"`.
const ENTERS_TEXT = "When this creature enters, scry X, where X is its power.";

export default defineCard({
  name: "Spotter Thopter",
  manaCost: "{8}",
  types: ["artifact", "creature"],
  subtypes: ["Thopter"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text:
    "Prototype {3}{U} — 2/3 (You may cast this spell with different mana cost, color, and size. " +
    `It keeps its abilities and types.)\nFlying\n${ENTERS_TEXT}`,
  prototype: { cost: "{3}{U}", power: 2, toughness: 3 },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: { powerOf: "source" } },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
