import { defineCard } from "../define.js";

export default defineCard({
  name: "Giant Dustwasp",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  suspend: { n: 4, cost: "{1}{G}" },
  text: "Flying\nSuspend 4—{1}{G} (Rather than cast this card from your hand, you may pay {1}{G} and exile it with four time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)",
});
