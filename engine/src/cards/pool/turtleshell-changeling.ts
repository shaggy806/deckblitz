import { defineCard } from "../define.js";


export default defineCard({
  name: "Turtleshell Changeling",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 1,
  toughness: 4,
  keywords: ["changeling"],
  text: "Changeling (This card is every creature type.)\n{1}{U}: Switch this creature's power and toughness until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: { kind: "switch-pt", target: "source", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{U}: Switch this creature's power and toughness until end of turn.",
    },
  ],
});
