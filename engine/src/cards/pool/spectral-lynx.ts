import { defineCard } from "../define.js";

export default defineCard({
  name: "Spectral Lynx",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Spirit"],
  power: 2,
  toughness: 1,
  text: "Protection from green\n{B}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["G"] },
      text: "Protection from green",
    },
  ],
});
