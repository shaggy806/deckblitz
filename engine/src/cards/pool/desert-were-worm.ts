import { defineCard } from "../define.js";

// Ruling: it triggers only if the creatures had power 12 or greater at the time you attacked;
//   increases after they attack, such as from attack triggers, don't contribute.

const PT_TEXT = "This creature gets +2/+0 for each Mountain you control.";
const ATTACK_TEXT =
  "Whenever you attack with creatures with total power 12 or greater for the first time each turn, untap all attacking creatures. After this phase, there is an additional combat phase.";

export default defineCard({
  name: "Desert Were-Worm",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon", "Wurm"],
  power: 0,
  toughness: 5,
  text: `${PT_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Mountain", controlledBy: "you" }, pt: [2, 0] },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", totalPower: { atLeast: 12, firstTimeEachTurn: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap-all", filter: { type: "creature", attacking: true } },
          { kind: "additional-combat", afterThisPhase: true },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
