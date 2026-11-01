import { defineCard } from "../define.js";

// Rulings:
//   [2018-03-16] Although Mogg Flunkies can't attack alone, other attacking creatures don't have to
//     attack the same player, planeswalker, or battle. Similarly, other blocking creatures don't have
//     to block the same creature that Mogg Flunkies blocks.
//   [2018-03-16] If an effect says that Mogg Flunkies attacks or blocks if able and you control
//     another creature able to attack or block, you must attack or block with Mogg Flunkies and that
//     creature.
//   [2018-03-16] Once Mogg Flunkies has attacked or blocked, it will remain in combat even if you no
//     longer control another attacking or blocking creature.
//   [2018-03-16] If you control more than one Mogg Flunkies, they can attack or block together, even
//     if no other creatures attack or block.

const TEXT = "This creature can't attack or block alone.";

export default defineCard({
  name: "Mogg Flunkies",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-attack-alone", "cant-block-alone"], text: TEXT }],
});
