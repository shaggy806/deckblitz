import { defineCard } from "../define.js";

export default defineCard({
  name: "Darkling Stalker",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Shade", "Spirit"],
  power: 1,
  toughness: 1,
  text: "{B}: Regenerate this creature.\n{B}: This creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{B}: This creature gets +1/+1 until end of turn.",
    },
  ],
});
