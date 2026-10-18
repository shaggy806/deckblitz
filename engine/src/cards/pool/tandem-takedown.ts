import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 19179. March of the Machine.
//
// Terrific Team-Up's shape with both of yours optional. One of yours gone
// illegal: the other still gets +1/+0 and deals its damage; the last target
// gone: nothing deals damage (the rulings — `fight` skips an illegal side).

export default defineCard({
  name: "Tandem Takedown",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Up to two target creatures you control each get +1/+0 until end of turn. They each deal damage equal to their power to another target creature, planeswalker, or battle.",
  targets: [
    ...distinctTargets(2, "creature-you-control", { optional: true }),
    {
      kind: "other",
      of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker", "battle"] } },
      than: { slots: [0, 1] },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 1, toughness: 0, duration: "end-of-turn" },
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "fight", a: 0, b: 2, oneSided: true },
          { kind: "fight", a: 1, b: 2, oneSided: true },
        ],
      },
    ],
  },
});
