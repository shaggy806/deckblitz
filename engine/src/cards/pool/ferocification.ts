import { defineCard } from "../define.js";

// EDHREC rank 14332.
//
// A modal triggered ability: the mode, and its target, are chosen as it goes
// on the stack (rule 700.2b — `announced`).
const TRIGGER = "At the beginning of combat on your turn, choose one —";
const PUMP = "Target creature you control gets +2/+0 until end of turn.";
const EVADE = "Target creature you control gains menace and haste until end of turn.";

export default defineCard({
  name: "Ferocification",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${TRIGGER}\n• ${PUMP}\n• ${EVADE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: PUMP,
            targets: ["creature-you-control"],
            effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          },
          {
            text: EVADE,
            targets: ["creature-you-control"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
                { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER} ${PUMP} ${EVADE}`,
    },
  ],
});
