import { defineCard } from "../define.js";

export default defineCard({
  name: "Mistwalker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 1,
  toughness: 4,
  keywords: ["changeling", "flying"],
  text: "Changeling (This card is every creature type.)\nFlying\n{1}{U}: This creature gets +1/-1 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{U}: This creature gets +1/-1 until end of turn.",
    },
  ],
});
