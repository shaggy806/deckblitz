import { defineCard } from "../define.js";

export default defineCard({
  name: "Corpulent Corpse",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 3,
  keywords: ["fear"],
  suspend: { n: 5, cost: "{B}" },
  text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nSuspend 5—{B} (Rather than cast this card from your hand, you may pay {B} and exile it with five time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)",
});
