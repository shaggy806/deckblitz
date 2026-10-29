import { defineCard } from "../define.js";

// EDHREC rank 5183.
//
// The prevention is a one-shot rule for the turn: it keeps working after
// Pack Leader leaves (the ruling), and covers Dogs as each damage would be
// dealt (rule 615.1).

const TRIGGER_TEXT =
  "Whenever this creature attacks, prevent all combat damage that would be dealt this turn to Dogs you control.";

export default defineCard({
  name: "Pack Leader",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
  text: `Other Dogs you control get +1/+1.\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Dog" },
      grantPt: [1, 1],
      text: "Other Dogs you control get +1/+1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "damage-rule", to: { permanents: { subtype: "Dog", controlledBy: "you" } }, combat: true },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
