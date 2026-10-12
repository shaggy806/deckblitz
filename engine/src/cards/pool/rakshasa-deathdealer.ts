import { defineCard } from "../define.js";

export default defineCard({
  name: "Rakshasa Deathdealer",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 2,
  toughness: 2,
  text: "{B}{G}: This creature gets +2/+2 until end of turn.\n{B}{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{B}{G}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{B}{G}: This creature gets +2/+2 until end of turn.",
    },
    {
      cost: { mana: "{B}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}{G}: Regenerate this creature.",
    },
  ],
});
