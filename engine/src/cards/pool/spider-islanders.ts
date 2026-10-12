import { defineCard } from "../define.js";

export default defineCard({
  name: "Spider-Islanders",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spider", "Horror", "Citizen"],
  power: 4,
  toughness: 3,
  mayhem: { cost: "{1}{R}" },
  text: "Mayhem {1}{R} (You may cast this card from your graveyard for {1}{R} if you discarded it this turn. Timing rules still apply.)",
});
