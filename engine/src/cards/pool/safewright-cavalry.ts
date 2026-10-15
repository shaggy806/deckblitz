import { defineCard } from "../define.js";

// EDHREC rank 17290.
//
// Rulings:
//   [2025-11-17] If Safewright Cavalry gains menace and still has its first ability, it can't be
//     blocked at all.
const PUMP_TEXT = "{5}: Target Elf you control gets +2/+2 until end of turn.";

export default defineCard({
  name: "Safewright Cavalry",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 4,
  toughness: 4,
  text: `This creature can't be blocked by more than one creature.\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      blockedByAtMostOne: true,
      text: "This creature can't be blocked by more than one creature.",
    },
  ],
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Elf" } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
