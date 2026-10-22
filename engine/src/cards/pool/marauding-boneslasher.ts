import { defineCard } from "../define.js";

// EDHREC rank 28449.
//
// Rulings:
//   [2017-07-14] The other Zombie doesn't have to block.
//   [2017-07-14] Whether you control another Zombie is checked only as you declare blockers.

export default defineCard({
  name: "Marauding Boneslasher",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Minotaur"],
  power: 3,
  toughness: 3,
  text: "This creature can't block unless you control another Zombie.",
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { subtype: "Zombie" }, atLeast: 1, excludeSelf: true },
      },
      restrictions: ["cant-block"],
      text: "This creature can't block unless you control another Zombie.",
    },
  ],
});
