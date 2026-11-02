import { defineCard } from "../define.js";

// Rules 508.1c and 509.1b, on everyone's attacks and blocks, its controller's
// too. Counted over every defending player, so the first to block in a game of
// more than two uses it up for the others.
const ATTACK_TEXT = "No more than one creature can attack each combat.";
const BLOCK_TEXT = "No more than one creature can block each combat.";

export default defineCard({
  name: "Silent Arbiter",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 5,
  text: `${ATTACK_TEXT}\n${BLOCK_TEXT}`,
  static: [
    { affects: { scope: "self" }, attackLimit: { most: 1, covers: "all" }, text: ATTACK_TEXT },
    { affects: { scope: "self" }, blockLimit: { most: 1 }, text: BLOCK_TEXT },
  ],
});
