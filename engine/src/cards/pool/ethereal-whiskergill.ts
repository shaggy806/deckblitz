import { defineCard } from "../define.js";

// EDHREC rank 31051.

export default defineCard({
  name: "Ethereal Whiskergill",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nThis creature can't attack unless defending player controls an Island.",
  static: [
    {
      affects: { scope: "self" },
      cantAttackUnlessDefender: { controls: { subtype: "Island" } },
      text: "This creature can't attack unless defending player controls an Island.",
    },
  ],
});
