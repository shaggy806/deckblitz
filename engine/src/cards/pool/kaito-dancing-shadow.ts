import { defineCard } from "../define.js";

// EDHREC rank 7484. Makes "Drone Token (Kaito, Dancing Shadow)".
//
// "One of them" is one of the creatures that dealt that combat damage, still
// on the battlefield. "Twice this turn" is a rule about this Kaito for the
// turn, not an ability he gains, and isn't additive (the ruling): the same
// ability twice, or two different ones.
const SHADOW =
  "Whenever one or more creatures you control deal combat damage to a player, you may return one of them to its owner's hand. If you do, you may activate loyalty abilities of Kaito twice this turn rather than only once.";
const PLUS = "+1: Up to one target creature can't attack or block until your next turn.";
const ZERO = "0: Draw a card.";
const MINUS =
  '−2: Create a 2/2 colorless Drone artifact creature token with deathtouch and "When this token leaves the battlefield, each opponent loses 2 life and you gain 2 life."';

export default defineCard({
  name: "Kaito, Dancing Shadow",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Kaito"],
  loyalty: 3,
  text: `${SHADOW}\n${PLUS}\n${ZERO}\n${MINUS}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { inSet: "trigger-batch" },
            upTo: 1,
            min: 0,
            prompt: "You may return one of them to its owner's hand.",
            then: { kind: "return-to-hand", target: 0 },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand" },
            then: { kind: "loyalty-activations", target: "source", times: 2, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: SHADOW,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "restrict",
        target: 0,
        restrictions: ["cant-attack", "cant-block"],
        duration: "until-your-next-turn",
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ZERO,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Drone Token (Kaito, Dancing Shadow)", count: 1 },
      resolve: null,
      text: MINUS,
    },
  ],
});
