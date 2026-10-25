import { defineCard } from "../define.js";

// EDHREC rank 18913.
//
// Rulings:
//   [2016-04-08] When resolving the first ability of Brain in a Jar, the newly-placed charge
//     counter will be counted when determining what spells you may cast. No player may take any
//     action between you placing the counter and choosing which spell to cast.
//   [2016-04-08] If you cast a card "without paying its mana cost," you can't choose to cast it
//     for any alternative costs, such as awaken costs. You can, however, pay additional costs,
//     such as kicker costs. If the card has any mandatory additional costs, such as that of
//     Lightning Axe, you must pay those to cast the card.
//   [2016-04-08] If Brain in a Jar leaves the battlefield before its first ability resolves, use
//     the number of counters on it at the moment it left to determine what spell you may cast.
//     That number won't change because you can't put a new counter on Brain in a Jar.
//   [2016-04-08] If the card has {X} in its mana cost, you must choose 0 as the value of X.
// The count is read after the counter goes on, as the cast is offered; a Brain
// that has left is read as it last existed (rule 608.2h), as Blast Zone's is.
// A free cast's X is 0 (rule 107.3b), and `cast-now` is a "may".

const CAST_TEXT =
  "{1}, {T}: Put a charge counter on this artifact, then you may cast an instant or sorcery spell with mana value equal to the number of charge counters on this artifact from your hand without paying its mana cost.";
const SCRY_TEXT = "{3}, {T}, Remove X charge counters from this artifact: Scry X.";

export default defineCard({
  name: "Brain in a Jar",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${CAST_TEXT}\n${SCRY_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
          {
            kind: "cast-now",
            from: "hand",
            free: true,
            spell: {
              typesAnyOf: ["instant", "sorcery"],
              manaValue: { op: "eq", n: { amount: { countersOn: "source", counter: "charge" } } },
            },
          },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      cost: { mana: "{3}", tap: true, removeCounter: { kind: "charge", count: "x" } },
      targets: [],
      effect: { kind: "scry", amount: "x" },
      resolve: null,
      text: SCRY_TEXT,
    },
  ],
});
