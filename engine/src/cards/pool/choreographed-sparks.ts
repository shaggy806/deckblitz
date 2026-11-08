import { defineCard } from "../define.js";

// EDHREC rank 9932. See Double's `cantBeCopied`; the creature spell's copy
// gains haste and the end-step sacrifice as Nalfeshnee's does (`gains`, kept by
// the token it becomes). A copy keeps the original's modes and targets unless
// new ones are chosen (the rulings).

const SAC_TEXT = "At the beginning of the end step, sacrifice this token.";
const MODE_1 = "Copy target instant or sorcery spell you control. You may choose new targets for the copy.";
const MODE_2 = `Copy target creature spell you control. The copy gains haste and "${SAC_TEXT}"`;

export default defineCard({
  name: "Choreographed Sparks",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `This spell can't be copied.\nChoose one or both —\n• ${MODE_1}\n• ${MODE_2}`,
  cantBeCopied: true,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: MODE_1,
        targets: [{ kind: "spell", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
        effect: { kind: "copy-spell", target: 0, newTargets: true },
      },
      {
        text: MODE_2,
        targets: [{ kind: "spell", whose: "you", filter: { type: "creature" } }],
        effect: {
          kind: "copy-spell",
          target: 0,
          gains: {
            keywords: ["haste"],
            triggered: [
              {
                trigger: { on: "step-begins", step: "end", who: "any" },
                targets: [],
                effect: { kind: "sacrifice-source" },
                resolve: null,
                text: SAC_TEXT,
              },
            ],
          },
        },
      },
    ],
  },
});
