import { defineCard } from "../define.js";

export default defineCard({
  name: "Uthden Troll",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 2,
  toughness: 2,
  text: "{R}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{R}: Regenerate this creature.",
    },
  ],
});
