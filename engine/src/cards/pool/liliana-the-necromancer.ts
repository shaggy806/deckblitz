import { defineCard } from "../define.js";

// EDHREC rank 15936.
//
// Rulings:
//   −7 may be activated with no targets, and still puts up to two creature
//   cards onto the battlefield; with targets that have all become illegal, it
//   doesn't resolve. The cards are chosen after the destruction, so the
//   destroyed creatures can be among them; their dies triggers wait until the
//   cards are on the battlefield.
//
// The two destructions are one event (`simultaneous`); the cards are chosen
// from every graveyard as it resolves, not targeted, and enter under your
// control.

const PLUS_TEXT = "+1: Target player loses 2 life.";
const MINUS_TEXT = "−1: Return target creature card from your graveyard to your hand.";
const ULT_TEXT =
  "−7: Destroy up to two target creatures. Put up to two creature cards from graveyards onto the battlefield under your control.";

export default defineCard({
  name: "Liliana, the Necromancer",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Liliana"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: { kind: "lose-life", amount: 2, target: 0 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: "creature", max: 2 }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
          {
            kind: "look-and-choose",
            zone: "graveyards",
            min: 0,
            max: 2,
            destination: "battlefield",
            leftover: "stay",
            filter: { type: "creature" },
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
