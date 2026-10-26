import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 12269.
//
// Rulings:
//   [2021-03-19] If a permanent on the battlefield has {X} in its mana cost, X is considered to be
//     0.
//   [2021-03-19] The mana value of a token that isn't a copy of another object is 0. A token that
//     is a copy of another object has the same mana cost as that object.
//   [2021-03-19] If the target permanent is an illegal target by the time Repeal tries to resolve,
//     the spell doesn't resolve. You don't draw a card.

export default defineCard({
  name: "Repeal",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target nonland permanent with mana value X to its owner's hand.\nDraw a card.",
  targets: [{ kind: "permanent", filter: { notTypes: ["land"], manaValue: { op: "eq", n: "x" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
