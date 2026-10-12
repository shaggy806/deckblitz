import { defineCard } from "../define.js";

export default defineCard({
  name: "Hellkite Overlord",
  manaCost: "{4}{B}{R}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 8,
  toughness: 8,
  keywords: ["flying", "trample", "haste"],
  text: "Flying, trample, haste\n{R}: This creature gets +1/+0 until end of turn.\n{B}{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
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
