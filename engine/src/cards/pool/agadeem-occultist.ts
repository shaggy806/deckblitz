import { defineCard } from "../define.js";

// EDHREC rank 18236.
//
// Rulings:
//   [2010-03-01] You may target any creature card in an opponent’s graveyard with Agadeem
//     Occultist’s ability. You check whether the targeted card’s mana value is less than or equal
//     to the number of Allies you control when the ability resolves. If you control too few Allies
//     at that point, the ability does nothing.
//
// Prismatic Ending's resolution-time mana value check.

const TEXT =
  "{T}: Put target creature card from an opponent's graveyard onto the battlefield under your control if its mana value is less than or equal to the number of Allies you control.";

export default defineCard({
  name: "Agadeem Occultist",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Shaman", "Ally"],
  power: 0,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "opponent", filter: { type: "creature" } }],
      effect: {
        kind: "conditional",
        condition: {
          kind: "target",
          index: 0,
          filter: { manaValue: { op: "lte", n: { amount: { countOf: { subtype: "Ally", controlledBy: "you" } } } } },
        },
        then: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
