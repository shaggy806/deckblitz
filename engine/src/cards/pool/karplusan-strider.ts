import { defineCard } from "../define.js";

// EDHREC rank 30995.

export default defineCard({
  name: "Karplusan Strider",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Yeti"],
  power: 3,
  toughness: 4,
  text: "This creature can't be the target of blue or black spells.",
  static: [
    {
      affects: { scope: "self" },
      hexproofFrom: { colors: ["U", "B"], spellsOnly: true, anyController: true, notHexproof: true },
      text: "This creature can't be the target of blue or black spells.",
    },
  ],
});
