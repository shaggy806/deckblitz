import { defineCard } from "../define.js";

// Legends. EDHREC rank 25530.
//
// Rulings:
//   A token creature that's destroyed is put into its owner's graveyard, and will be counted
//   by Hellfire's effect.
//   Hellfire checks the number of creatures put into graveyards as the result of its effect,
//   not the number of creatures destroyed as a result of its effect.
//   A creature that regenerates instead of being destroyed doesn't leave the battlefield, so
//   it's not put into a graveyard.
//
// `thisWay: "died"` is exactly that: destroyed by this effect and put into a
// graveyard, every player's creatures counted.
export default defineCard({
  name: "Hellfire",
  manaCost: "{2}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy all nonblack creatures. Hellfire deals X plus 3 damage to you, where X is the number of creatures that died this way.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature", notColors: ["B"] } },
      { kind: "damage", amount: { sum: [{ thisWay: "died", who: "each-player" }, 3] }, who: "you" },
    ],
  },
});
