import { defineCard } from "../define.js";

// The target is chosen as it triggers; whether to sacrifice is asked as it
// resolves (its ruling), and an illegal target stops the whole ability, the
// sacrifice included. "If you do" is `sacrifice-source`'s `then`.
const CAST_TEXT =
  "Whenever you cast a Bolas planeswalker spell, you may sacrifice this creature. If you do, destroy target creature.";

export default defineCard({
  name: "Wasp of the Bitter End",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect", "Horror"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "planeswalker", subtype: "Bolas" } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Sacrifice Wasp of the Bitter End to destroy the target creature?",
        effect: { kind: "sacrifice-source", then: { kind: "destroy", target: 0 } },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
