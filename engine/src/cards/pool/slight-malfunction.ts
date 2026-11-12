import { defineCard } from "../define.js";

// EDHREC rank 13833. Its ruling: the second mode has no targets as it's cast;
// the roll makes a reflexive trigger whose targets are chosen then, up to the
// result.

const ROLL_TEXT =
  "Roll a six-sided die. When you do, Slight Malfunction deals 1 damage to each of up to X target creatures, where X is the result.";

export default defineCard({
  name: "Slight Malfunction",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Choose one —\n• Destroy target artifact.\n• ${ROLL_TEXT}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: "Destroy target artifact.", targets: ["artifact"], effect: { kind: "destroy", target: 0 } },
      {
        text: ROLL_TEXT,
        targets: [],
        effect: {
          kind: "roll-dice",
          sides: 6,
          then: {
            kind: "reflexive-trigger",
            targets: [{ kind: "any-number", of: "creature", max: { triggerValue: true } }],
            value: { roll: "total" },
            effect: {
              kind: "for-each-target",
              from: 0,
              simultaneous: true,
              effect: { kind: "damage", amount: 1, target: 0 },
            },
            text: "When you do, Slight Malfunction deals 1 damage to each of up to X target creatures, where X is the result.",
          },
        },
      },
    ],
  },
});
