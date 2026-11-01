import { defineCard } from "../define.js";

// The delayed ability is set up as this resolves, and "it" is that object: one
// that has left and come back by then is a new object (rule 400.7). It's set up
// even if the creature couldn't be turned up.

const TEXT = "{T}: Turn target face-down creature you control face up. At the beginning of the next end step, sacrifice it.";

export default defineCard({
  name: "Skirk Alarmist",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", faceDown: true, controlledBy: "you" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "turn-face-up", target: 0 },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
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
