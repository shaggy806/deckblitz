import { defineCard } from "../define.js";

// EDHREC rank 23223.

export default defineCard({
  name: "Skirk Shaman",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 2,
  text: "This creature can't be blocked except by artifact creatures and/or red creatures.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { notTypes: ["artifact"], notColors: ["R"] },
      text: "This creature can't be blocked except by artifact creatures and/or red creatures.",
    },
  ],
});
