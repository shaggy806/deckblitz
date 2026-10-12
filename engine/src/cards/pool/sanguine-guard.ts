import { defineCard } from "../define.js";

export default defineCard({
  name: "Sanguine Guard",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\n{1}{B}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{B}: Regenerate this creature.",
    },
  ],
});
