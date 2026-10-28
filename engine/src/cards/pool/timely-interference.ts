import { defineCard } from "../define.js";

// EDHREC rank 22819. Kicked, `kicker.effect` replaces the
// spell's effect: the same -1/-0 and draw, with the blocking requirement
// (no attacker named) between them.

export default defineCard({
  name: "Timely Interference",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Kicker {1}{R} (You may pay an additional {1}{R} as you cast this spell.)\nTarget creature gets -1/-0 until end of turn. If this spell was kicked, that creature blocks this turn if able.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -1, toughness: 0, duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
  kicker: {
    cost: "{1}{R}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: -1, toughness: 0, duration: "end-of-turn" },
        { kind: "block-if-able", target: 0 },
        { kind: "draw", amount: 1 },
      ],
    },
  },
});
