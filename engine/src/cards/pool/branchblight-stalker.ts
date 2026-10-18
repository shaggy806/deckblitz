import { defineCard } from "../define.js";

// EDHREC rank 13325.

export default defineCard({
  name: "Branchblight Stalker",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Elf", "Scout"],
  power: 3,
  toughness: 1,
  toxic: 2,
  text: "Toxic 2 (Players dealt combat damage by this creature also get two poison counters.)",
});
