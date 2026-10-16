import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// EDHREC rank 23093.
//
// Rulings:
//   [2024-02-02] Eliminate the Impossible affects only creatures your opponents control at the
//     time it resolves. Creatures they begin to control later in the turn won't get -2/-0 and
//     won't stop being suspected.
//
// "Them" is the creatures your opponents control: the suspected ones among
// them stop being suspected (Absolving Lammasu's filter form of `unsuspect`).

export default defineCard({
  name: "Eliminate the Impossible",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Investigate. Creatures your opponents control get -2/-0 until end of turn. If any of them are suspected, they're no longer suspected. (To investigate, create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      investigate(),
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: -2,
        toughness: 0,
        duration: "end-of-turn",
      },
      { kind: "unsuspect", filter: { type: "creature", controlledBy: "opponent", suspected: true } },
    ],
  },
});
