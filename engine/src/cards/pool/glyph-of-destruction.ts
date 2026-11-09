import { defineCard } from "../define.js";

// EDHREC rank 26661. +10/+0 until end of combat (rule 511.2), every bit of
// damage to it prevented this turn, destroyed at the next end step.

const TEXT =
  "Target blocking Wall you control gets +10/+0 until end of combat. Prevent all damage that would be dealt to it this turn. Destroy it at the beginning of the next end step.";

export default defineCard({
  name: "Glyph of Destruction",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Wall", blocking: true, controlledBy: "you" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 10, toughness: 0, duration: "until-end-of-combat" },
      { kind: "prevent-damage", target: 0, amount: "all" },
      {
        kind: "delayed-trigger",
        at: { step: "end" },
        effect: { kind: "destroy", target: 0 },
        text: "Destroy it.",
      },
    ],
  },
});
