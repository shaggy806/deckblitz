import { defineCard } from "../define.js";

export default defineCard({
  name: "Horned Troll",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 2,
  toughness: 2,
  text: "{G}: Regenerate this creature.",
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
