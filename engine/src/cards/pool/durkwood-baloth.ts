import { defineCard } from "../define.js";

export default defineCard({
  name: "Durkwood Baloth",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 5,
  suspend: { n: 5, cost: "{G}" },
  text: "Suspend 5—{G} (Rather than cast this card from your hand, you may pay {G} and exile it with five time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)",
});
