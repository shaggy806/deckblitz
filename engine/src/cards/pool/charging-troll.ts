import { defineCard } from "../define.js";

export default defineCard({
  name: "Charging Troll",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\n{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{G}: Regenerate this creature.",
    },
  ],
});
