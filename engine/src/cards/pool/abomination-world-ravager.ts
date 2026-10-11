import { defineCard } from "../define.js";

export default defineCard({
  name: "Abomination, World Ravager",
  manaCost: "{7}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gamma", "Berserker", "Villain"],
  power: 10,
  toughness: 10,
  keywords: ["menace", "trample"],
  mayhem: { cost: "{4}{R}" },
  text:
    "Menace, trample\n" +
    "Mayhem {4}{R} (You may cast this card from your graveyard for {4}{R} if you discarded it this turn. Timing rules still apply.)",
});
