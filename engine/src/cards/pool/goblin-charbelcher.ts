import { defineCard } from "../define.js";

// Rulings:
//   [2016-06-08] If you reveal no land cards, Goblin Charbelcher deals damage equal to the number of
//     cards revealed, and then you may order your library as you like.
//   [2016-06-08] You must choose a target for Goblin Charbelcher's ability as you activate it, before
//     you reveal any cards.
//
// The cards go to the bottom as the `reveal-until` finishes, before the damage
// that the text puts first: nothing can act in between, and "this way" reads
// them wherever they went.
const TEXT =
  "{3}, {T}: Reveal cards from the top of your library until you reveal a land card. This artifact deals damage equal to the number of nonland cards revealed this way to any target. If the revealed land card was a Mountain, this artifact deals double that damage instead. Put the revealed cards on the bottom of your library in any order.";
const NONLAND = { thisWay: "revealed", filter: { notTypes: ["land"] } } as const;

export default defineCard({
  name: "Goblin Charbelcher",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "reveal-until", filter: { type: "land" }, rest: "bottom-any-order" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "revealed", filter: { subtype: "Mountain" } },
            then: { kind: "damage", amount: { product: [NONLAND, 2] }, target: 0 },
            else: { kind: "damage", amount: NONLAND, target: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
