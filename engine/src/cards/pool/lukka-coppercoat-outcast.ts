import { defineCard } from "../define.js";

// EDHREC rank 12771. The exiled creature cards are castable as long as you
// control any Lukka (the ruling). The −2 reads the exiled creature's mana value
// as it applies; with no greater one the whole library goes back in a random
// order (the ruling).
const PLUS_TEXT =
  '+1: Exile the top three cards of your library. Creature cards exiled this way gain "You may cast this card from exile as long as you control a Lukka planeswalker."';
const MINUS_TEXT =
  "−2: Exile target creature you control, then reveal cards from the top of your library until you reveal a creature card with greater mana value. Put that card onto the battlefield and the rest on the bottom of your library in a random order.";
const ULT_TEXT = "−7: Each creature you control deals damage equal to its power to each opponent.";

export default defineCard({
  name: "Lukka, Coppercoat Outcast",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Lukka"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 3,
        duration: "while-exiled",
        filter: { type: "creature" },
        gate: { kind: "controls", filter: { type: "planeswalker", subtype: "Lukka" }, atLeast: 1, countsSelf: true },
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "reveal-until",
            filter: { type: "creature", manaValue: { op: "gt", n: { amount: { manaValueOf: 0 } } } },
            put: "battlefield",
            rest: "bottom-random",
          },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "each-deals-damage",
        filter: { type: "creature", controlledBy: "you" },
        amount: "its-power",
        to: { who: "each-opponent" },
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
