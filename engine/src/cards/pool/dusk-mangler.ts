import { defineCard } from "../define.js";

// Streets of New Capenna. The additional cost is one of three, the caster's
// pick. The enters trigger is three instructions in order (its ruling): every
// opponent sacrifices, then every opponent discards, then each loses 4 life.
const ENTER_TEXT =
  "When this creature enters, each opponent sacrifices a creature of their choice, discards a card, and loses 4 life.";

export default defineCard({
  name: "Dusk Mangler",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 5,
  toughness: 4,
  text: `As an additional cost to cast this spell, sacrifice a creature, discard a card, or pay 4 life.\n${ENTER_TEXT}`,
  additionalCost: {
    options: [
      { sacrifice: { type: "creature", controlledBy: "you" }, text: "Sacrifice a creature" },
      { discard: 1, text: "Discard a card" },
      { payLife: 4, text: "Pay 4 life" },
    ],
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
          { kind: "discard", target: "each-opponent", amount: 1 },
          { kind: "lose-life", amount: 4, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
