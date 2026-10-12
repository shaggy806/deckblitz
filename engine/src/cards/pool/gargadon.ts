import { defineCard } from "../define.js";

export default defineCard({
  name: "Gargadon",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 7,
  toughness: 5,
  keywords: ["trample"],
  suspend: { n: 4, cost: "{1}{R}" },
  text: "Trample\nSuspend 4—{1}{R} (Rather than cast this card from your hand, you may pay {1}{R} and exile it with four time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)",
});
