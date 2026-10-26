import { defineCard } from "../define.js";

// EDHREC rank 29597.
//
// Rulings:
//   [2012-10-01] Untapping an attacking creature doesn't cause it to stop attacking or remove it
//     from combat.
//   [2012-10-01] Bazaar Krovod's ability can target an attacking creature that's untapped (such as
//     one with vigilance).
//
// Restless Ridgeline's shape.

export default defineCard({
  name: "Bazaar Krovod",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 5,
  text: "Whenever this creature attacks, another target attacking creature gets +0/+2 until end of turn. Untap that creature.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 0, toughness: 2, duration: "end-of-turn" },
          { kind: "untap", target: 0 },
        ],
      },
      resolve: null,
      text: "Whenever this creature attacks, another target attacking creature gets +0/+2 until end of turn. Untap that creature.",
    },
  ],
});
