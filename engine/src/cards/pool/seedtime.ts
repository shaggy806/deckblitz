import { defineCard } from "../define.js";

// EDHREC rank 10222.
//
// Rulings:
//   [2004-10-04] You only get an extra turn if an opponent cast a blue spell this turn prior to
//     this spell resolving. Note that "casting" a spell only requires it to be announced, so an
//     unresolved spell still counts as having been cast.
//
// The condition is read as Seedtime resolves, over every spell an opponent cast
// this turn as it was cast (`cast-this-turn` — a spell still on the stack, or
// countered, counts: the ruling).

const TURN_TEXT = "Take an extra turn after this one if an opponent cast a blue spell this turn.";

export default defineCard({
  name: "Seedtime",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Cast this spell only during your turn.\n${TURN_TEXT}`,
  castOnlyIf: { kind: "your-turn" },
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "cast-this-turn", who: "opponent", filter: { colors: ["U"] } },
    then: { kind: "take-extra-turn" },
  },
});
