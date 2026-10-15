import { defineCard } from "../define.js";

// EDHREC rank 18244.
//
// Once per declaration, however many fliers attack (Hermes, Overseer of
// Elpis's `attack-with`). The loot is Narset of the Ancient Way's, with its
// discard mandatory: only a nonland card discarded fires the reflexive
// trigger, whose target is chosen as it goes on the stack.

const ATTACK_TEXT =
  "Whenever one or more creatures you control with flying attack, draw a card, then discard a card. When you discard a nonland card this way, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Teo, Spirited Glider",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot", "Ally"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { keyword: "flying" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { notTypes: ["land"] } },
            then: {
              kind: "reflexive-trigger",
              targets: ["creature-you-control"],
              effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
              text: "When you discard a nonland card this way, put a +1/+1 counter on target creature you control.",
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
