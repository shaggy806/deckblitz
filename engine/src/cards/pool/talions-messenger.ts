import { defineCard } from "../define.js";

// EDHREC rank 9734. Wilds of Eldraine. Teo, Spirited Glider's loot with a
// reflexive counter: the Faerie is chosen as the reflexive ability goes on
// the stack, once a card has actually been discarded (its ruling). "Target
// Faerie" is any permanent with the Faerie subtype.
const ATTACK_TEXT =
  "Whenever you attack with one or more Faeries, draw a card, then discard a card. When you discard a card this way, put a +1/+1 counter on target Faerie you control.";

export default defineCard({
  name: "Talion's Messenger",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Noble"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { subtype: "Faerie" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded" },
            then: {
              kind: "reflexive-trigger",
              targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Faerie" } }],
              effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
              text: "When you discard a card this way, put a +1/+1 counter on target Faerie you control.",
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
