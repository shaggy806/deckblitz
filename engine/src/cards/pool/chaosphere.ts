import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 16664. A world enchantment (the world rule, 704.5k).

const BLOCK_TEXT = "Creatures with flying can block only creatures with flying.";
const REACH_TEXT = "Creatures without flying have reach. (They can block creatures with flying.)";

export default defineCard({
  name: "Chaosphere",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: `${BLOCK_TEXT}\n${REACH_TEXT}`,
  static: [
    { affects: { scope: "all-creatures", withKeyword: "flying" }, canBlockOnly: { keyword: "flying" }, text: BLOCK_TEXT },
    { affects: { scope: "all-creatures", withoutKeyword: "flying" }, grantKeywords: ["reach"], text: REACH_TEXT },
  ],
});
