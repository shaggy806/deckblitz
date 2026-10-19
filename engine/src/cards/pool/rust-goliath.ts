import { defineCard } from "../define.js";

// EDHREC rank 15443.
//
// Prototype (rule 718) is `prototype`, as on Combat Thresher: cast for {3}{G}{G} it's a green
// 3/5 on the stack and the battlefield, and a colorless 10/10 everywhere else.

export default defineCard({
  name: "Rust Goliath",
  manaCost: "{10}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 10,
  toughness: 10,
  keywords: ["reach", "trample"],
  text:
    "Prototype {3}{G}{G} — 3/5 (You may cast this spell with different mana cost, color, and size. " +
    "It keeps its abilities and types.)\nReach, trample",
  prototype: { cost: "{3}{G}{G}", power: 3, toughness: 5 },
});
