import { defineCard } from "../define.js";

export default defineCard({
  name: "Loxodon Mender",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Cleric"],
  power: 3,
  toughness: 3,
  text: "{W}, {T}: Regenerate target artifact.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["artifact"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{W}, {T}: Regenerate target artifact.",
    },
  ],
});
