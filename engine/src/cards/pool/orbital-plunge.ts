import { defineCard } from "../define.js";

// EDHREC rank 14287.
//
// Excess damage (rule 120.4a) is what this damage dealt past lethal, damage
// already marked on the creature counted (the ruling): the resolution's own
// `excess-damage-this-way`, not the creature's history this turn.

export default defineCard({
  name: "Orbital Plunge",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Orbital Plunge deals 6 damage to target creature. If excess damage was dealt this way, create a Lander token. (It's an artifact with \"{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.\")",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 6, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "excess-damage-this-way" },
        then: { kind: "create-token", token: "Lander Token", count: 1 },
      },
    ],
  },
});
