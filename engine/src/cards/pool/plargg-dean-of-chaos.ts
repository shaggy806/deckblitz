import { defineCard } from "../define.js";

// EDHREC rank 12131. The front face of Plargg, Dean of Chaos // Augusta, Dean
// of Order (a modal double-faced card).
//
// Rulings:
//   [2021-04-16] Plargg, Dean of Chaos's second ability allows you to cast the spell during that
//     ability's resolution, ignoring its normal timing restrictions.
//
// The reveal is `reveal-until` without exiling: the card found is offered as a
// free `cast-now`, and every revealed card still in the library — the found
// one too, when it isn't cast — goes to the bottom in a random order.
const DIG_TEXT =
  "{4}{R}, {T}: Reveal cards from the top of your library until you reveal a nonlegendary, nonland card with mana value 3 or less. You may cast that card without paying its mana cost. Put all revealed cards not cast this way on the bottom of your library in a random order.";

export default defineCard({
  name: "Plargg, Dean of Chaos",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc", "Shaman"],
  power: 2,
  toughness: 2,
  text: `{T}, Discard a card: Draw a card.\n${DIG_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}, Discard a card: Draw a card.",
    },
    {
      cost: { mana: "{4}{R}", tap: true },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: {
          notSupertype: "legendary",
          notTypes: ["land"],
          manaValue: { op: "lte", n: 3 },
        },
        then: { kind: "cast-now", target: 0, free: true },
        rest: "bottom-random",
      },
      resolve: null,
      text: DIG_TEXT,
    },
  ],
  faces: ["Plargg, Dean of Chaos", "Augusta, Dean of Order"],
});
