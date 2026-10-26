import { defineCard } from "../define.js";

// EDHREC rank 32183. The Karoo lands' bounce, untargeted.

const TEXT = "When this creature enters, return a land you control to its owner's hand.";

export default defineCard({
  name: "Noggle Bridgebreaker",
  manaCost: "{2}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Noggle", "Rogue"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "land", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a land you control to its owner's hand",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
