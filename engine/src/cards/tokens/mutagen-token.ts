import { defineCard } from "../define.js";

// Michelangelo, Mutant BFF's Mutagen token.

export default defineCard({
  name: "Mutagen Token",
  art: "6559c423-449c-4e8e-8384-3ce78183e317",
  colors: [],
  types: ["artifact"],
  subtypes: ["Mutagen"],
  text: "{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
