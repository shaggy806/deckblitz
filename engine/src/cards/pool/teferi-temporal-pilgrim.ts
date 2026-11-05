import { defineCard } from "../define.js";

const DRAWS = "Whenever you draw a card, put a loyalty counter on Teferi.";
const ZERO = "0: Draw a card.";
const MINUS_TWO =
  "−2: Create a 2/2 blue Spirit creature token with vigilance and \"Whenever you draw a card, put a +1/+1 counter on this token.\"";
const ULT =
  "−12: Target opponent chooses a permanent they control and returns it to its owner's hand. Then they shuffle each nonland permanent they control into its owner's library.";

export default defineCard({
  name: "Teferi, Temporal Pilgrim",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Teferi"],
  loyalty: 4,
  text: `${DRAWS}\n${ZERO}\n${MINUS_TWO}\n${ULT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "loyalty", amount: 1 },
      resolve: null,
      text: DRAWS,
    },
  ],
  activated: [
    { loyaltyCost: 0, cost: { mana: null, tap: false }, targets: [], effect: { kind: "draw", amount: 1 }, resolve: null, text: ZERO },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Vigilance, Grows on Draw)", count: 1 },
      resolve: null,
      text: MINUS_TWO,
    },
    {
      loyaltyCost: -12,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: {
        kind: "as-player",
        who: { target: 0 },
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "choose-permanents",
              filter: { controlledBy: "you" },
              min: 1,
              upTo: 1,
              then: { kind: "return-to-hand", target: 0 },
              prompt: "Return a permanent you control to its owner's hand",
            },
            {
              kind: "for-each-permanent",
              filter: { notTypes: ["land"], controlledBy: "you" },
              simultaneous: true,
              effect: { kind: "shuffle-into-library", target: 0 },
            },
          ],
        },
      },
      resolve: null,
      text: ULT,
    },
  ],
});
