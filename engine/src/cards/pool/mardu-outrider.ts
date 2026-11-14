import { defineCard } from "../define.js";

// EDHREC rank 26081.
export default defineCard({
  name: "Mardu Outrider",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 5,
  toughness: 5,
  text: "As an additional cost to cast this spell, discard a card.",
  additionalCost: { discard: 1 },
});
