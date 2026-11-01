import { defineCard } from "../define.js";

// EDHREC rank 27042. "An artifact or another creature": only the creature
// branch says "another" (`isSource: false` on it, matched against the
// source), so this creature pays only if it has become an artifact.

const TEXT = "{2}, Sacrifice an artifact or another creature: Put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Malevolent Noble",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: false,
        sacrifice: { filter: { anyOf: [{ type: "artifact" }, { type: "creature", isSource: false }] } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
