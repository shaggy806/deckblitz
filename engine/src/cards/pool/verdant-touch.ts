import { defineCard } from "../define.js";

// EDHREC rank 26642.
//
// Rulings:
//   [2004-10-04] The land is still a land and retains all its abilities, plus any other
//     characteristics.
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn. It doesn't matter how long the
//     permanent has been a creature.

export default defineCard({
  name: "Verdant Touch",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  kicker: { cost: "{3}", keyword: "buyback" },
  text: "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nTarget land becomes a 2/2 creature that's still a land. (This effect lasts indefinitely.)",
  targets: ["land"],
  effect: {
    kind: "animate",
    target: 0,
    power: 2,
    toughness: 2,
    addTypes: ["creature"],
    addSubtypes: [],
    duration: "permanent",
  },
});
