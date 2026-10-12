import { defineCard } from "../define.js";

export default defineCard({
  name: "Chosen of Markov",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  text: "{T}, Tap an untapped Vampire you control: Transform this creature.",
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        tapOthers: { count: 1, filter: { subtype: "Vampire", controlledBy: "you" } },
      },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{T}, Tap an untapped Vampire you control: Transform this creature.",
    },
  ],
  faces: ["Chosen of Markov", "Markov's Servant"],
  transform: true,
});
