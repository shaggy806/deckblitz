import { defineCard } from "../define.js";

// EDHREC rank 6232.
//
// Rulings:
//   [2020-01-24] The last ability of Altar of the Pantheon is a mana ability. It doesn't use the
//     stack and can't be responded to. You'll immediately add mana and gain 1 life, if applicable.
//   [2020-01-24] Your devotion to two colors (for example, your devotion to red and green) is
//     increased by one, not by two or three.
//   [2020-01-24] If Altar of the Pantheon loses its abilities, you'll still get a bonus to your
//     devotion. This is because its effect is applied before any effect that would make it lose
//     its abilities.
//   [2020-01-24] You gain just 1 life, no matter how many Gods, Demigods, and/or legendary
//     enchantments you control beyond the first.

export default defineCard({
  name: "Altar of the Pantheon",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "Your devotion to each color and each combination of colors is increased by one.\n{T}: Add one mana of any color. If you control a God, a Demigod, or a legendary enchantment, you gain 1 life.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      // A mana ability that gains the life as part of it (Pristine
      // Talisman's `also`), once however many it finds. A God that isn't a
      // creature is no God then, but it's still a legendary enchantment.
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        also: {
          kind: "conditional",
          condition: {
            kind: "controls",
            filter: {
              anyOf: [
                { subtype: "God" },
                { subtype: "Demigod" },
                { type: "enchantment", supertype: "legendary" },
              ],
            },
            atLeast: 1,
          },
          then: { kind: "gain-life", amount: 1 },
        },
      },
      resolve: null,
      text: "{T}: Add one mana of any color. If you control a God, a Demigod, or a legendary enchantment, you gain 1 life.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      devotionBonus: 1,
      text: "Your devotion to each color and each combination of colors is increased by one.",
    },
  ],
});
