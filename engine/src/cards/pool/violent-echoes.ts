import { defineCard } from "../define.js";

// Rulings:
//   [2026-08-21] For a planeswalker, excess damage means damage in excess of the planeswalker's
//     loyalty; for a creature, damage greater than lethal damage, damage already marked on it
//     taken into account (rule 120.4a).
//   [2026-08-21] If you control a Jace planeswalker token, the counters go on it (several: you
//     choose one); only with none is one created first (rule 701.71a).
//   [2026-08-21] If the target is illegal as it tries to resolve, it doesn't resolve: no empower.

export default defineCard({
  name: "Violent Echoes",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Violent Echoes deals 6 damage to target creature or planeswalker. If excess damage was dealt to that permanent this way, empower Jace X, where X is that excess damage. (Put that many loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 6, target: 0 },
      {
        // The excess dealt to that permanent this way (Hell to Pay, Orbital
        // Plunge); none, and no Jace is empowered (or made).
        kind: "conditional",
        condition: { kind: "excess-damage-this-way", to: 0 },
        then: { kind: "empower-jace", amount: { excessDamageThisWay: true, to: 0 } },
      },
    ],
  },
});
