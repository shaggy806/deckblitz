import { defineCard } from "../define.js";

// EDHREC rank 17373.
//
// The `block-additional` effect, for the turn.
//
// Rulings:
//   [2018-03-16] Act of Heroism can target an untapped creature. It still gets +2/+2 and can block
//     an additional creature.
//   [2018-03-16] You can cast Act of Heroism even if the target creature won't be able to block
//     right away, perhaps because you're the attacking player.
//   [2018-03-16] Untapping an attacking creature doesn't remove it from combat.
//   [2018-03-16] The effects of Act of Heroism are cumulative. If multiples resolve targeting the
//     same creature, that creature can block that many additional creatures this turn.

export default defineCard({
  name: "Act of Heroism",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Untap target creature. It gets +2/+2 until end of turn and can block an additional creature this turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "block-additional", target: 0, amount: 1, duration: "end-of-turn" },
    ],
  },
});
