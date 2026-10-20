import { defineCard } from "../define.js";

// EDHREC rank 21020.

export default defineCard({
  name: "Morkrut Behemoth",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Giant"],
  power: 7,
  toughness: 6,
  keywords: ["menace"],
  text: "As an additional cost to cast this spell, sacrifice a creature or pay {1}{B}.\nMenace (This creature can't be blocked except by two or more creatures.)",
  additionalCost: {
    options: [
      { text: "Sacrifice a creature", sacrifice: { type: "creature", controlledBy: "you" } },
      { text: "Pay {1}{B}", mana: "{1}{B}" },
    ],
  },
});
