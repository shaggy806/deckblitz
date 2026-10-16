import { defineCard } from "../define.js";

// EDHREC rank 7009.
//
// Rulings:
//   [2023-11-10] Some spells and abilities that cause you to discover may require targets. If each
//     target chosen is an illegal target as that spell or ability tries to resolve, it won't
//     resolve and you won't discover.
//   [2023-11-10] If you cast a spell "without paying its mana cost", you can't choose to cast it
//     for any alternative costs. You can, however, pay additional costs. If the spell has any
//     mandatory additional costs, you must pay those to cast it.
//   [2023-11-10] If you can't cast the discovered card (perhaps because there are no legal targets
//     for the spell), you'll put it into your hand.
//   [2023-11-10] You exile the cards face up. All players will be able to see them.
//   [2023-11-10] When you discover, you must exile cards. The only optional part of the ability is
//     whether you cast the exiled card or put it into your hand.
//   [2023-11-10] If the discovered card has {X} in its mana cost, you must choose 0 as the value
//     of X when casting it without paying its mana cost.
//   [2023-11-10] If you discover an adventurer card, split card, or modal double-faced card, you
//     might be able to cast that card with either set of characteristics depending on the effect's
//     discover value. For example, if you discover 4 and reveal Galvanic Giant (an adventurer card
//     from Wilds of Eldraine with a mana value of 4), you could cast Galvanic Giant, but not Storm
//     Reading (its Adventure, which has a mana value of 7). If you discover 7 and reveal Galvanic
//     Giant, you could cast either Galvanic Giant or Storm Reading.
//   [2023-11-10] The mana value of a split card is determined by the combined mana cost of its two
//     halves. If discover allows you to cast a split card, you may cast either half (as long as
//     its mana value is less than or equal to the effect's discover value) but not both halves.
//   [2023-11-10] A spell's mana value is determined only by its mana cost. Ignore any alternative
//     costs, additional costs, cost increases, or cost reductions.

const DISCOVER =
  "When this Aura enters, discover 3. (Exile cards from the top of your library until you exile a nonland card with mana value 3 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)";

export default defineCard({
  name: "Etali's Favor",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${DISCOVER}\nEnchanted creature gets +1/+1 and has trample.`,
  targets: ["creature-you-control"],
  // Discover 3 (rule 701.57a) — Hidden Nursery's discover shape at 3.
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discover", amount: 3 },
      resolve: null,
      text: DISCOVER,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["trample"],
      text: "Enchanted creature gets +1/+1 and has trample.",
    },
  ],
});
