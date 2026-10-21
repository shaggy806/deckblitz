import { defineCard } from "../define.js";

// EDHREC rank 21509. Ikoria: Lair of Behemoths.
//
// Rulings:
//   - If two Phase Dolphins attack at the same time, their abilities can target each other.
//   - The target creature can't be blocked this turn even if Phase Dolphin leaves the battlefield.
const TRIGGER_TEXT = "Whenever this creature attacks, another target attacking creature can't be blocked this turn.";

export default defineCard({
  name: "Phase Dolphin",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Whale"],
  power: 1,
  toughness: 4,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
