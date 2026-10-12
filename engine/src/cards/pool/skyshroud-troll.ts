import { defineCard } from "../define.js";

export default defineCard({
  name: "Skyshroud Troll",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Giant"],
  power: 3,
  toughness: 3,
  text: "{1}{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{G}: Regenerate this creature.",
    },
  ],
});
