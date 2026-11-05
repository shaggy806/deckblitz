import { defineCard } from "../define.js";

// EDHREC rank 1585. "That's one or more colors" is `colorless: false`; a
// colorless permanent stays, whatever its mana value.

export default defineCard({
  name: "Ugin, the Spirit Dragon",
  manaCost: "{8}",
  colors: [],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ugin"],
  loyalty: 7,
  text: "+2: Ugin deals 3 damage to any target.\n−X: Exile each permanent with mana value X or less that's one or more colors.\n−10: You gain 7 life, draw seven cards, then put up to seven permanent cards from your hand onto the battlefield.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "+2: Ugin deals 3 damage to any target.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "exile-all", filter: { colorless: false, manaValue: { op: "lte", n: { amount: "x" } } } },
      resolve: null,
      text: "−X: Exile each permanent with mana value X or less that's one or more colors.",
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 7 },
          { kind: "draw", amount: 7 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 7,
            destination: "battlefield",
            leftover: "stay",
            filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
          },
        ],
      },
      resolve: null,
      text: "−10: You gain 7 life, draw seven cards, then put up to seven permanent cards from your hand onto the battlefield.",
    },
  ],
});
