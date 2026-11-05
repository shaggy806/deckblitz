import { defineCard } from "../define.js";

// EDHREC rank 25162.
//
// "You choose"; "put the rest" is the caster's instruction too, as Cruel Fate's.

export default defineCard({
  name: "Bamboozle",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player reveals the top four cards of their library. You choose two of those cards and put them into that player's graveyard. Put the rest on top of their library in any order.",
  targets: ["player"],
  effect: {
    kind: "look-and-choose",
    from: { target: 0 },
    zone: "library",
    count: 4,
    reveal: true,
    min: 2,
    max: 2,
    destination: "graveyard",
    leftover: "top-any-order",
  },
});
