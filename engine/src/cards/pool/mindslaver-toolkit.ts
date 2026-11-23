import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). "Choose any number" is chosen as it's
// activated (rule 700.2a), none allowed — Rankle, Master of Pranks' shape.

export default defineCard({
  name: "Mindslaver Toolkit",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text:
    "{T}: Target opponent gains control of Mindslaver Toolkit.\n" +
    "{X}, {T}: Choose any number —\n" +
    "• You lose X life.\n" +
    "• You discard X cards.\n" +
    "• You sacrifice X permanents.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["opponent"],
      effect: { kind: "gain-control", target: "source", who: { target: 0 }, untilEndOfTurn: false },
      resolve: null,
      text: "{T}: Target opponent gains control of Mindslaver Toolkit.",
    },
    {
      cost: { mana: "{X}", tap: true },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 0,
        maxModes: 3,
        modes: [
          { text: "You lose X life.", effect: { kind: "lose-life", amount: "x" } },
          { text: "You discard X cards.", effect: { kind: "discard", target: "you", amount: "x" } },
          {
            text: "You sacrifice X permanents.",
            effect: { kind: "sacrifice", who: "you", filter: {}, count: "x" },
          },
        ],
      },
      resolve: null,
      text: "{X}, {T}: Choose any number —\n• You lose X life.\n• You discard X cards.\n• You sacrifice X permanents.",
    },
  ],
});
