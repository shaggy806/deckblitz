import { defineCard } from "../define.js";

// EDHREC rank 10083.
//
// "Exile it at the beginning of the next end step" is a real delayed
// triggered ability (rule 603.7) about the token this resolution made (Old
// Hob, Alleycat Blues' shape).
const TEXT =
  "At the beginning of combat on your turn, create a 1/1 red Pirate creature token with menace and haste. Exile it at the beginning of the next end step.";

export default defineCard({
  name: "Daring Piracy",
  manaCost: "{2}{R}",
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
          { kind: "create-token", token: "Pirate Token (Daring Piracy)", count: 1, separate: true },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            about: "created",
            effect: { kind: "exile", target: 0 },
            text: "Exile it at the beginning of the next end step.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
