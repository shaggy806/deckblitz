import { defineCard } from "../define.js";

// EDHREC rank 10378.
//
// Rulings:
//   [2023-06-16] Gimli's Fury checks whether the creature is legendary as it resolves. If the
//     target isn't legendary as the spell is cast but becomes one before the spell resolves, that
//     creature will gain trample.
//
// The "target" condition reads the creature as the spell resolves (Ancient
// Animus's shape).

export default defineCard({
  name: "Gimli's Fury",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +3/+2 until end of turn. If it's legendary, it also gains trample until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 2, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { supertype: "legendary" } },
        then: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      },
    ],
  },
});
