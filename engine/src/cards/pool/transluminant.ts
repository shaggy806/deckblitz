import { defineCard } from "../define.js";

const TEXT =
  "{W}, Sacrifice this creature: Create a 1/1 white Spirit creature token with flying at the beginning of the next end step.";

export default defineCard({
  name: "Transluminant",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "create-token", token: "Spirit Token", count: 1 },
        text: "At the beginning of the next end step, create a 1/1 white Spirit creature token with flying.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
