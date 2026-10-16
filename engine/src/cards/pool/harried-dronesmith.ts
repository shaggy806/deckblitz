import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of combat on your turn, create a 1/1 colorless Thopter artifact creature token with flying. It gains haste until end of turn. Sacrifice it at the beginning of your next end step.";

export default defineCard({
  name: "Harried Dronesmith",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      // "Sacrifice it" is a delayed trigger about the token just made (Old
      // Hob's shape), at *your* next end step; you sacrifice it only while
      // you control it (rule 701.21a).
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Thopter Token", count: 1, gainUntilEndOfTurn: ["haste"], separate: true },
          {
            kind: "delayed-trigger",
            at: "your-next-end-step",
            about: "created",
            effect: { kind: "sacrifice-target", target: 0 },
            text: "Sacrifice it at the beginning of your next end step.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
