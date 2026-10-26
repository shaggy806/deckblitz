import { defineCard } from "../define.js";

// EDHREC rank 7806.
//
// Rulings:
//   [2020-08-07] Horsemanship is a keyword ability that functions similarly to flying. It appears
//     in the Portal: Three Kingdoms set and does not appear in the Double Masters set. This means
//     that in most cases Rolling Earthquake will simply deal X damage to each creature and each
//     player, even creatures depicted on horseback in their illustration.

export default defineCard({
  name: "Rolling Earthquake",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Rolling Earthquake deals X damage to each creature without horsemanship and each player.",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature", notKeyword: "horsemanship" }, amount: "x" },
      { kind: "damage", amount: "x", who: "each-player" },
    ],
  },
});
