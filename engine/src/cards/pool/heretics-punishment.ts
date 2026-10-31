import { defineCard } from "../define.js";

// Rulings:
//   [2011-09-22] If you have two or fewer cards in your library when the ability resolves, all of
//     them will be put into your graveyard. Heretic's Punishment will still deal damage equal to
//     the highest mana value among those cards.
//   [2011-09-22] If all three cards have a mana value of 0, no damage will be dealt.

const ABILITY_TEXT =
  "{3}{R}: Choose any target, then mill three cards. This enchantment deals damage to that permanent or player equal to the greatest mana value among the milled cards.";

export default defineCard({
  name: "Heretic's Punishment",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: ABILITY_TEXT,
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          { kind: "damage", target: 0, amount: { thisWay: "milled", greatestOf: "mana-value" } },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
