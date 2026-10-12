import { defineCard } from "../define.js";

export default defineCard({
  name: "Raging Goblinoids",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Berserker", "Villain"],
  power: 5,
  toughness: 4,
  keywords: ["haste"],
  mayhem: { cost: "{2}{R}" },
  text: "Haste\nMayhem {2}{R} (You may cast this card from your graveyard for {2}{R} if you discarded it this turn. Timing rules still apply.)",
});
