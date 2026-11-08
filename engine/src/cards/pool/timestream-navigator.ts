import { defineCard } from "../define.js";

export default defineCard({
  name: "Timestream Navigator",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate", "Wizard"],
  power: 1,
  toughness: 1,
  keywords: ["ascend"],
  text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n{2}{U}{U}, {T}, Put this creature on the bottom of its owner's library: Take an extra turn after this one. Activate only if you have the city's blessing.",
  activated: [
    {
      cost: { mana: "{2}{U}{U}", tap: true, do: { kind: "put-on-library", target: "source", position: "bottom" } },
      targets: [],
      effect: { kind: "take-extra-turn" },
      resolve: null,
      condition: { kind: "citys-blessing" },
      text: "{2}{U}{U}, {T}, Put this creature on the bottom of its owner's library: Take an extra turn after this one. Activate only if you have the city's blessing.",
    },
  ],
});
