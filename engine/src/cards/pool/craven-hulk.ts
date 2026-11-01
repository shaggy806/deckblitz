import { defineCard } from "../define.js";

// Rulings:
//   [2021-02-05] If you control more than one Craven Hulk, they can all block together, even if no
//     other creatures block.
//   [2021-02-05] If an effect says that Craven Hulk blocks "if able," and you control at least one
//     other creature that is able to block, you must block with Craven Hulk and at least one other
//     creature.
//   [2021-02-05] Once Craven Hulk has been declared as a blocking creature, it will remain in combat
//     even if all other blockers leave the battlefield or are otherwise removed from combat.
//   [2021-02-05] Although Craven Hulk can't be the only creature you declare as a blocking creature,
//     it can be the only creature that blocks any given attacking creature.

const TEXT = "This creature can't block alone.";

export default defineCard({
  name: "Craven Hulk",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Coward"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block-alone"], text: TEXT }],
});
