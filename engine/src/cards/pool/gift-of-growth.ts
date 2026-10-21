import { defineCard } from "../define.js";

// EDHREC rank 19556.
//
// Rulings:
//   [2018-04-27] If Gift of Growth was kicked, the target creature is untapped before getting
//     +4/+4.
//
// Might of Murasa's kicker shape: the kicked spell's whole effect, the untap
// first in both.

export default defineCard({
  name: "Gift of Growth",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Kicker {2} (You may pay an additional {2} as you cast this spell.)\nUntap target creature. It gets +2/+2 until end of turn. If this spell was kicked, that creature gets +4/+4 until end of turn instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
    ],
  },
  kicker: {
    cost: "{2}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "untap", target: 0 },
        { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
      ],
    },
  },
});
