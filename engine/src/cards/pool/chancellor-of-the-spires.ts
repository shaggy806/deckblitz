import { defineCard } from "../define.js";

// EDHREC rank 12737.
//
// Rulings:
//   [2011-06-01] You may pay additional costs, such as kicker costs, of the instant or sorcery
//     card.
//   [2011-06-01] If you are unable to cast the card, perhaps because there are no legal targets
//     available, the card remains in its owner's graveyard.
//   [2011-06-01] If the card has any mandatory additional costs, then you must pay them in order
//     to cast the spell.
//   [2011-06-01] If you reveal more than one Chancellor of the Spires from your opening hand, each
//     opponent will put the top seven cards of their library into their graveyard that many times
//     (for a total of fourteen, twenty-one, or twenty-eight cards).
//   [2011-06-01] The instant or sorcery card you target with the "enters" triggered ability is
//     cast as part of the resolution of that ability. Timing restrictions based on the card's type
//     are ignored. Other restrictions, such as "Cast [this card] only during combat," are not.
//   [2021-03-19] A player's "opening hand" is the hand of cards the player has after all players
//     have taken mulligans. If players have any cards in hand that allow actions to be taken with
//     them from a player's opening hand, the starting player takes all such actions first in any
//     order, followed by each other player in turn order. Then the first turn begins.

const REVEAL =
  "You may reveal this card from your opening hand. If you do, at the beginning of the first upkeep, each opponent mills seven cards.";
const ETB =
  "When this creature enters, you may cast target instant or sorcery card from an opponent's graveyard without paying its mana cost.";

export default defineCard({
  name: "Chancellor of the Spires",
  manaCost: "{4}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Sphinx"],
  power: 5,
  toughness: 7,
  keywords: ["flying"],
  text: `${REVEAL}\nFlying\n${ETB}`,
  openingHandReveal: {
    at: "next-upkeep",
    effect: { kind: "mill", target: "each-opponent", amount: 7 },
    text: REVEAL,
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "opponent", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: { kind: "cast-now", target: 0, free: true },
      resolve: null,
      text: ETB,
    },
  ],
});
