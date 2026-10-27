import { defineCard } from "../define.js";

export default defineCard({
  name: "Mortipede",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 4,
  toughness: 1,
  text: "{2}{G}: All creatures able to block this creature this turn do so.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "restrict", target: "source", restrictions: ["must-be-blocked"] },
      resolve: null,
      text: "{2}{G}: All creatures able to block this creature this turn do so.",
    },
  ],
});
