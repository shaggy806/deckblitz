import { defineCard } from "../define.js";

const TEXT =
  "Whenever you sacrifice another permanent, you may pay {3}. If you do, create a token that's a copy of this creature.";

export default defineCard({
  name: "Sorcerer's Broom",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", otherOnly: true },
      targets: [],
      // A Broom that has left still makes a copy of itself as it last was
      // (its ruling — `create-token-copy` of "source" reads it so).
      effect: {
        kind: "may",
        prompt: "Pay {3} to create a token that's a copy of Sorcerer's Broom?",
        cost: "{3}",
        effect: { kind: "create-token-copy", of: "source", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
