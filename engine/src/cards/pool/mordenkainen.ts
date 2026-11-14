import { defineCard } from "../define.js";

// EDHREC rank 8147. The −10's cards aren't drawn (its ruling): the hand and
// library are exchanged in one move (rule 701.12d), then the library shuffled.
const PLUS = "+2: Draw two cards, then put a card from your hand on the bottom of your library.";
const MINUS =
  "−2: Create a blue Dog Illusion creature token with \"This token's power and toughness are each equal to twice the number of cards in your hand.\"";
const ULTIMATE =
  "−10: Exchange your hand and library, then shuffle. You get an emblem with \"You have no maximum hand size.\"";

export default defineCard({
  name: "Mordenkainen",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Mordenkainen"],
  loyalty: 5,
  text: `${PLUS}\n${MINUS}\n${ULTIMATE}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "library-bottom", leftover: "stay" },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Dog Illusion Token", count: 1 },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exchange-hand-and-library" },
          { kind: "shuffle-library" },
          {
            kind: "create-emblem",
            text: "You have no maximum hand size.",
            static: { affects: { scope: "self" }, noMaxHandSize: true, text: "You have no maximum hand size." },
          },
        ],
      },
      resolve: null,
      text: ULTIMATE,
    },
  ],
});
