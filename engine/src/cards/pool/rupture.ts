import { defineCard } from "../define.js";

// EDHREC rank 18651. Grab the Reins' sacrifice-then-read, with Earthquake's
// simultaneous damage to each creature without flying and each player. The
// sacrificed creature's power is read as it last existed.

export default defineCard({
  name: "Rupture",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Sacrifice a creature. Rupture deals damage equal to that creature's power to each creature without flying and each player.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: { thisWay: "sacrificed", sumOf: "power" } },
          { kind: "damage", amount: { thisWay: "sacrificed", sumOf: "power" }, who: "each-player" },
        ],
      },
    ],
  },
});
