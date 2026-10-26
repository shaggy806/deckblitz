import { defineCard } from "../define.js";

// EDHREC rank 27000.
// Makes Hornet → "Hornet Token".
//
// "Destroy it at the beginning of the next end step" is a delayed triggered
// ability (rule 603.7) about the token this made (`about: "created"`, Old Hob,
// Alleycat Blues' shape); the token is made on its own (`separate`), so only it
// is destroyed.

const TEXT =
  "{3}, {T}: Create a 1/1 colorless Insect artifact creature token with flying and haste named Hornet. Destroy it at the beginning of the next end step.";

export default defineCard({
  name: "Hornet Cannon",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Hornet Token", count: 1, separate: true },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            about: "created",
            effect: { kind: "destroy", target: 0 },
            text: "Destroy it at the beginning of the next end step.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
