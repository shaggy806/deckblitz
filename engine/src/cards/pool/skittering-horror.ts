import { defineCard } from "../define.js";

// Urza's Destiny (UDS). EDHREC rank 31856. The trigger resolves before the
// creature spell does (its ruling) — a `cast-spell` trigger.

const TEXT = "When you cast a creature spell, sacrifice this creature.";

export default defineCard({
  name: "Skittering Horror",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
