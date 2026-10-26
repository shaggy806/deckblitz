import { defineCard } from "../define.js";

// EDHREC rank 12878.

export default defineCard({
  name: "Cryptoplasm",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 2,
  text: "At the beginning of your upkeep, you may have this creature become a copy of another target creature, except it has this ability.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "may",
        prompt: "Have Cryptoplasm become a copy of another target creature, except it has this ability?",
        effect: {
          kind: "become-copy",
          target: "source",
          of: 0,
          exceptions: { thisAbility: { card: "Cryptoplasm", triggered: 0 } },
        },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may have this creature become a copy of another target creature, except it has this ability.",
    },
  ],
});
