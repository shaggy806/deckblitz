import { defineCard } from "../define.js";

// Coven is an intervening "if" (rule 603.4), checked as it triggers and as it
// resolves (the rulings); the blocking rule then holds for the turn whatever
// the powers become.

const TEXT =
  "Coven — At the beginning of combat on your turn, if you control three or more creatures with different powers, this creature can't be blocked by creatures with power 2 or less this turn.";

export default defineCard({
  name: "Harvesttide Sentry",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "restrict",
        target: "source",
        restrictions: [],
        cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      },
      resolve: null,
      text: TEXT,
      condition: { kind: "coven" },
    },
  ],
});
