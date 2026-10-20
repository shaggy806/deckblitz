import { defineCard } from "../define.js";

// EDHREC rank 21187.
//
// Rulings:
//   [2021-11-19] A creature has been dealt excess damage if Lacerate Flesh deals more damage to it
//     than the minimum amount of damage required to be lethal damage. In most cases, this means
//     damage greater than the creature's toughness, but take into account any damage that was
//     already dealt to it that turn.
//
// Hell to Pay's excess-damage count, making Blood tokens.

export default defineCard({
  name: "Lacerate Flesh",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Lacerate Flesh deals 4 damage to target creature. Create a number of Blood tokens equal to the amount of excess damage dealt to that creature this way. (They're artifacts with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      { kind: "create-token", token: "Blood Token", count: { excessDamageThisWay: true, to: 0 } },
    ],
  },
});
