import { defineCard } from "../define.js";

// EDHREC rank 12295. Future Sight.
//
// Rulings:
//   If Molten Disaster was kicked, Molten Disaster has split second as long as
//     it's on the stack.
//   If you copy a kicked spell on the stack, the copy is also kicked.
//
// "If this spell was kicked, it has split second" is a conditional printed
// split second (`splitSecond: { kind: "self-kicked" }`), read from the
// spell's side whenever split second is asked (rule 702.61a) — a kicked copy
// has it too (rule 707.10). Earthquake's damage otherwise.

const KICKED_TEXT = "If this spell was kicked, it has split second.";
const DAMAGE_TEXT = "Molten Disaster deals X damage to each creature without flying and each player.";

export default defineCard({
  name: "Molten Disaster",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  kicker: { cost: "{R}" },
  splitSecond: { kind: "self-kicked" },
  text: `Kicker {R}\n${KICKED_TEXT}\n${DAMAGE_TEXT}`,
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: "x" },
      { kind: "damage", amount: "x", who: "each-player" },
    ],
  },
});
