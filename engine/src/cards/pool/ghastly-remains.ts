import { defineCard } from "../define.js";

// EDHREC rank 29333.

export default defineCard({
  name: "Ghastly Remains",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 0,
  toughness: 0,
  text: "Amplify 1 (As this creature enters, put a +1/+1 counter on it for each Zombie card you reveal in your hand.)\nAt the beginning of your upkeep, if this card is in your graveyard, you may pay {B}{B}{B}. If you do, return it to your hand.",
  triggered: [
    {
      fromGraveyard: true,
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {B}{B}{B} to return Ghastly Remains to your hand?",
        cost: "{B}{B}{B}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: "At the beginning of your upkeep, if this card is in your graveyard, you may pay {B}{B}{B}. If you do, return it to your hand.",
    },
  ],
  amplify: 1,
});
