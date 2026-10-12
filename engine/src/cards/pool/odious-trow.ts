import { defineCard } from "../define.js";

export default defineCard({
  name: "Odious Trow",
  manaCost: "{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 1,
  toughness: 1,
  text: "{1}{B/G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{1}{B/G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{B/G}: Regenerate this creature.",
    },
  ],
});
