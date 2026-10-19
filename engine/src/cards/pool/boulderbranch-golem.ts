import { defineCard } from "../define.js";

// The Brothers' War. Prototype (rule 718): cast for {3}{G} it's a green 3/3.
// The life is its power as the trigger resolves, or as it last existed on the
// battlefield if it has left (the ruling) — `powerOf: "source"` reads
// last-known information.
const ENTERS_TEXT = "When this creature enters, you gain life equal to its power.";

export default defineCard({
  name: "Boulderbranch Golem",
  manaCost: "{7}",
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 6,
  toughness: 5,
  text:
    "Prototype {3}{G} — 3/3 (You may cast this spell with different mana cost, color, and size. " +
    `It keeps its abilities and types.)\n${ENTERS_TEXT}`,
  prototype: { cost: "{3}{G}", power: 3, toughness: 3 },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { powerOf: "source" } },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
