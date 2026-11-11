import { defineCard } from "../define.js";

const PRAY_TEXT =
  "Pray — Once during each of your turns, you may cast a creature spell from among cards in your graveyard that were put there from anywhere other than the battlefield this turn.";
const ATTACK_TEXT = "Whenever you attack, you may pay {1} and discard a card. If you do, draw a card.";

export default defineCard({
  name: "Banon, the Returners' Leader",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Rebel"],
  power: 1,
  toughness: 3,
  text: `${PRAY_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "graveyard",
        filter: {
          type: "creature",
          putIntoGraveyardThisTurn: {},
          not: { putIntoGraveyardThisTurn: { from: ["battlefield"] } },
        },
        oncePerTurn: true,
        yourTurnOnly: true,
      },
      text: PRAY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "conditional",
        // Both halves are the price: with no card to discard it can't be paid.
        condition: { kind: "hand-size", atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Pay {1} and discard a card to draw a card?",
          cost: "{1}",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "discard", target: "you", amount: 1 },
              { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
            ],
          },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
