import { defineCard } from "../define.js";

const TEXT = "Whenever an opponent casts a creature spell, create a token that's a copy of it, except it's 1/1.";

export default defineCard({
  name: "Welcome to Mini-apolis",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: "trigger-object",
        count: 1,
        who: "you",
        exceptions: { power: 1, toughness: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
