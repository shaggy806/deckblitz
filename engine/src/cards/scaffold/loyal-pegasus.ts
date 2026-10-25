import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 19457.
//
// Rulings:
//   [2019-07-12] In a Two-Headed Giant game, Loyal Pegasus can attack or block with a creature
//     controlled by your teammate, even if no other creatures you control are attacking or
//     blocking.
//   [2019-07-12] If you control more than one Loyal Pegasus, they can attack or block together,
//     even if no other creatures attack or block.
//   [2019-07-12] If an effect says that Loyal Pegasus attacks or blocks "if able," and you control
//     one or more other creatures that are able to attack or block, you must attack or block with
//     Loyal Pegasus and at least one other creature.
//   [2019-07-12] Although Loyal Pegasus can't attack alone, other attacking creatures don't have
//     to attack the same player or planeswalker. For example, Loyal Pegasus could attack an
//     opponent and another creature could attack a planeswalker that opponent controls. Similarly,
//     other blocking creatures don't have to block the same creature that Loyal Pegasus blocks.
//   [2019-07-12] Once Loyal Pegasus has attacked or blocked, it will remain in combat even if you
//     no longer control another attacking or blocking creature.

export default defineCard({
  name: "Loyal Pegasus",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Pegasus"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nThis creature can't attack or block alone.",
  // TODO(scaffold): This creature can't attack or block alone.
});
