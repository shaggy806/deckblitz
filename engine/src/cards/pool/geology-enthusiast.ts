import { defineCard } from "../define.js";

// EDHREC rank 16555. The Brothers' War.
// Rulings:
//   Although all the cards in The Brothers' War that create Powerstone tokens create a tapped
//   Powerstone token, entering the battlefield tapped isn't part of the token's definition.

const END_TEXT = "At the beginning of your end step, create a tapped Powerstone token.";
const DRAW_TEXT = "{6}: Draw a card and put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Geology Enthusiast",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 5,
  text: `${END_TEXT} (It's an artifact with "{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.")\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
