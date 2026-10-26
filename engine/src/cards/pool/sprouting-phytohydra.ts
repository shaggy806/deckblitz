import { defineCard } from "../define.js";

// EDHREC rank 17370.
//
// Polyraptor's shape, made optional: the copy is made even if the damage
// destroyed the Phytohydra (the ruling), from its last known information.

const TEXT = "Whenever this creature is dealt damage, you may create a token that's a copy of this creature.";

export default defineCard({
  name: "Sprouting Phytohydra",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Hydra"],
  power: 0,
  toughness: 2,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a token that's a copy of Sprouting Phytohydra?",
        effect: { kind: "create-token-copy", of: "source", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
