import { defineCard } from "../define.js";

export default defineCard({
  name: "Errant Ephemeron",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  suspend: { n: 4, cost: "{1}{U}" },
  text: "Flying\nSuspend 4—{1}{U} (Rather than cast this card from your hand, you may pay {1}{U} and exile it with four time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)",
});
