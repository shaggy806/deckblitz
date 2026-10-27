import { defineCard } from "../define.js";

// The tokens are made whether or not the sacrifice happens (one instruction
// doesn't depend on the other), so it's a plain sequence; X is the entering
// creature's mana value, read off it as it last existed if it has left.

const TEXT =
  "When a creature enters, sacrifice this artifact and create X 2/2 green Monkey creature tokens, where X is that creature's mana value.";

export default defineCard({
  name: "Monkey Cage",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-source" },
          { kind: "create-token", token: "Monkey Token", count: { manaValueOf: "trigger-object" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
