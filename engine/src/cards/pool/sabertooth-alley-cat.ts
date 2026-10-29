import { defineCard } from "../define.js";

// EDHREC rank 30462.
//
// "Creatures without defender can't block this creature this turn" is a
// block filter on it for the turn (`restrict`'s `cantBeBlockedBy`).

const BLOCK_TEXT = "{1}{R}: Creatures without defender can't block this creature this turn.";

export default defineCard({
  name: "Sabertooth Alley Cat",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 1,
  text: `This creature attacks each combat if able.\n${BLOCK_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "restrict",
        target: "source",
        restrictions: [],
        cantBeBlockedBy: { notKeyword: "defender" },
      },
      resolve: null,
      text: BLOCK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
