import { defineCard } from "../define.js";

// Final Fantasy Commander (FIC).
//
// Rulings:
//   As you put Umaro's triggered ability on the stack, you choose a mode at random. Players can
//     respond to the ability knowing which mode was chosen.
//   In the incredibly rare case where there is no legal target for the last mode, that mode can't
//     be chosen. The first two modes are always eligible to be chosen.

const HEAD = "At the beginning of combat on your turn, choose one at random —";
const PUMP = "Other creatures you control get +3/+0 and gain trample until end of turn.";
const WHEEL = "Discard your hand, then draw four cards.";
const BLAST = "Umaro deals 5 damage to any target.";

const OTHERS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Umaro, Raging Yeti",
  manaCost: "{5}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Yeti", "Berserker"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${HEAD}\n• ${PUMP}\n• ${WHEEL}\n• ${BLAST}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        random: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: PUMP,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt-all", filter: OTHERS, exceptSource: true, power: 3, toughness: 0, duration: "end-of-turn" },
                { kind: "grant-keyword-all", filter: OTHERS, exceptSource: true, keyword: "trample", duration: "end-of-turn" },
              ],
            },
          },
          {
            text: WHEEL,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "discard-hand", who: "you" },
                { kind: "draw", amount: 4 },
              ],
            },
          },
          { text: BLAST, targets: ["any-target"], effect: { kind: "damage", amount: 5, target: 0 } },
        ],
      },
      resolve: null,
      text: HEAD,
    },
  ],
});
