import { defineCard } from "../define.js";

const COPY = "Create a token that's a copy of target creature you control. It gains haste. Sacrifice it at the beginning of the next end step.";
const EXILE = "Exile target artifact or enchantment.";
const PUMP = "Creatures target player controls get +1/+1 and gain first strike until end of turn.";

export default defineCard({
  name: "Cabaretti Confluence",
  manaCost: "{3}{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["sorcery"],
  text: `Choose three. You may choose the same mode more than once.\n• ${COPY}\n• ${EXILE}\n• ${PUMP}`,
  targets: [],
  castModal: {
    minModes: 3,
    maxModes: 3,
    repeatModes: true,
    modes: [
      {
        text: COPY,
        targets: ["creature-you-control"],
        effect: { kind: "create-token-copy", of: 0, count: 1, gains: { keywords: ["haste"] }, sacrificeAtEndStep: true },
      },
      {
        text: EXILE,
        targets: ["artifact-or-enchantment"],
        effect: { kind: "exile", target: 0 },
      },
      {
        text: PUMP,
        targets: ["player"],
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "modify-pt-all",
              filter: { type: "creature", controlledBy: "you" },
              controlledByTarget: 0,
              power: 1,
              toughness: 1,
              duration: "end-of-turn",
            },
            {
              kind: "grant-keyword-all",
              filter: { type: "creature", controlledBy: "you" },
              controlledByTarget: 0,
              keyword: "first-strike",
              duration: "end-of-turn",
            },
          ],
        },
      },
    ],
  },
});
