import { defineCard } from "../define.js";

export default defineCard({
  name: "Keldon Halberdier",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 1,
  keywords: ["first-strike"],
  suspend: { n: 4, cost: "{R}" },
  text: "First strike\nSuspend 4—{R} (Rather than cast this card from your hand, you may pay {R} and exile it with four time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)",
});
