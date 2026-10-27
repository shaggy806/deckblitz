import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 22430. Exhaustion's shape: `skip-next-untap`
// reads the lands during that player's next untap step, so one that entered
// after this resolved is held too (the ruling).
//
// Rulings:
//   [2008-08-01] No land controlled by the player will untap during their next untap step. This
//     includes lands which entered the battlefield after Mana Vapors resolved.

export default defineCard({
  name: "Mana Vapors",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Lands target player controls don't untap during their next untap step.",
  targets: ["player"],
  effect: { kind: "skip-next-untap", filter: { type: "land" }, who: 0 },
});
