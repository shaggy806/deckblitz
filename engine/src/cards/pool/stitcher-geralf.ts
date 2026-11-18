import { defineCard } from "../define.js";

// EDHREC rank 13868.
//
// "Put into graveyards this way" is the mill's arrivals, so a card a
// replacement sent elsewhere (Rest in Peace) can't be chosen (its ruling);
// the Zombie's X is the total power of the cards the choice exiled — the
// resolution's exiled cards that were also chosen, so a card Rest in Peace
// exiled from the mill isn't counted (its ruling) — each read where it went
// (exile, a public zone: its printed power, a characteristic-defining one
// as it works there, rule 604.3).
//
// Rulings:
//   "Exiled this way" refers to the exile instruction that's part of the
//   ability's effect. If the cards each player would put into their
//   graveyard are exiled because of a replacement effect, those cards won't
//   be in the graveyards to be exiled by the next part of the ability.

export default defineCard({
  name: "Stitcher Geralf",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 4,
  text: "{2}{U}, {T}: Each player mills three cards. Exile up to two creature cards put into graveyards this way. Create an X/X blue Zombie creature token, where X is the total power of the cards exiled this way.",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "each-player", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyards",
            min: 0,
            max: 2,
            destination: "exile",
            leftover: "stay",
            filter: { type: "creature", thisWay: "put-into-graveyard" },
          },
          {
            kind: "create-token",
            token: "Zombie Token (Stitcher Geralf)",
            count: 1,
            basePt: {
              power: { aggregate: "sum", of: "power", filter: { thisWay: "chosen" }, in: { thisWay: "exiled" } },
              toughness: { aggregate: "sum", of: "power", filter: { thisWay: "chosen" }, in: { thisWay: "exiled" } },
            },
          },
        ],
      },
      resolve: null,
      text: "{2}{U}, {T}: Each player mills three cards. Exile up to two creature cards put into graveyards this way. Create an X/X blue Zombie creature token, where X is the total power of the cards exiled this way.",
    },
  ],
});
