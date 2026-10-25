import { defineCard } from "../define.js";

// +1: the target is chosen on activation, the discard happens on resolution
// (its rulings), and only a red card discarded this way deals the damage.
// −7: every red instant or sorcery card in the graveyard is offered, one
// after another, each cast for free as the ability resolves (`repeat`).

const PLUS_TEXT = "+1: Discard a card. If a red card is discarded this way, Chandra deals 4 damage to any target.";
const WHEEL_TEXT = "−2: Each player discards their hand, then draws three cards.";
const ULT_TEXT =
  "−7: Cast any number of red instant and/or sorcery cards from your graveyard without paying their mana costs.";

export default defineCard({
  name: "Chandra Ablaze",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${WHEEL_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { colors: ["R"] } },
            then: { kind: "damage", amount: 4, target: 0 },
          },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "each-player" },
          { kind: "draw", amount: 3, who: "each-player" },
        ],
      },
      resolve: null,
      text: WHEEL_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "cast-now",
        from: "graveyard",
        spell: { colors: ["R"], typesAnyOf: ["instant", "sorcery"] },
        free: true,
        repeat: true,
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
