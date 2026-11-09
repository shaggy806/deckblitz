import { defineCard } from "../define.js";
import { flipUntilLose } from "../helpers.js";

const TEXT =
  "Whenever a nontoken creature you control enters, flip a coin until you lose a flip. For each flip you won, create " +
  "a token that's a copy of that creature. Those tokens gain haste. Exile them at the beginning of the next end step.";

export default defineCard({
  name: "Mirror March",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", token: false } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          flipUntilLose(),
          {
            kind: "create-token-copy",
            of: "trigger-object",
            count: { thisWay: "flips-won" },
            who: "you",
            gains: { keywords: ["haste"] },
            exileAtEndStep: true,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
