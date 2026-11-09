import { defineCard } from "../define.js";

// EDHREC rank 3866. "The token created this way" is the `created` ref of the
// resolution: populate's own, after its choice.

const TEXT =
  "At the beginning of combat on your turn, populate. The token created this way gains haste. Sacrifice it at the beginning of the next end step. (To populate, create a token that's a copy of a creature token you control.)";

export default defineCard({
  name: "Determined Iteration",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "populate" },
          { kind: "grant-keyword", target: "created", keyword: "haste", duration: "permanent" },
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            about: "created",
            effect: { kind: "sacrifice-target", target: 0 },
            text: "Sacrifice it.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
