import { defineCard } from "../define.js";

// Avatar: The Last Airbender. Its own base power set alone, its toughness
// left at 4.

const ABILITY = "{3}: Until end of turn, this creature has base power 4 and gains trample.";

export default defineCard({
  name: "Turtle-Duck",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Turtle", "Bird"],
  power: 0,
  toughness: 4,
  text: ABILITY,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        addTypes: [],
        addSubtypes: [],
        keywords: ["trample"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ABILITY,
    },
  ],
});
