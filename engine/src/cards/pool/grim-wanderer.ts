import { defineCard } from "../define.js";

// EDHREC rank 18550. Any creature that died counts, whoever controlled it (its ruling).
// "Tragic Backstory" is an ability word.
export default defineCard({
  name: "Grim Wanderer",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Warlock"],
  power: 5,
  toughness: 3,
  keywords: ["flash"],
  text: "Flash\nTragic Backstory — Cast this spell only if a creature died this turn.",
  castOnlyIf: { kind: "creature-died-this-turn" },
});
