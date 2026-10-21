import { defineCard } from "../define.js";

// EDHREC rank 17937. Throne of Eldraine.
//
// The Knights are fixed as the trigger resolves (rule 611.2c): a
// `modify-pt-all` over the other Knights you control then.

export default defineCard({
  name: "Belle of the Brawl",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 2,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhenever this creature attacks, other Knights you control get +1/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Knight", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "Whenever this creature attacks, other Knights you control get +1/+0 until end of turn.",
    },
  ],
});
