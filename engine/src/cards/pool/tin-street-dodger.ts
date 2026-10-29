import { defineCard } from "../define.js";

// EDHREC rank 12023. "Except by creatures with defender" is the filter's
// negation; a block already made stands (the ruling).

export default defineCard({
  name: "Tin Street Dodger",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\n{R}: This creature can't be blocked this turn except by creatures with defender.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "restrict",
        target: "source",
        restrictions: [],
        cantBeBlockedBy: { notKeyword: "defender" },
      },
      resolve: null,
      text: "{R}: This creature can't be blocked this turn except by creatures with defender.",
    },
  ],
});
