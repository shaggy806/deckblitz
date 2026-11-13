import { defineCard } from "../define.js";

// EDHREC rank 3469.
// Rulings:
//   [2023-07-28] The colors chosen by players affect only whether or not permanents they control
//     will be exiled.
//   [2023-07-28] Lands have no mana cost, so they are colorless unless an effect states
//     otherwise.
//   [2023-07-28] Players decide and announce in turn order, starting with the active player,
//     which color they are choosing. Players later in the turn order will know which colors were
//     chosen by players before them.
//   [2023-07-28] No matter what color any player chooses, all multicolored permanents will be
//     exiled.
//
// The choices are an open "each player chooses" (rule 101.4) from the active
// player; then one exile of every permanent at once (rule 603.10a), each read
// against its own controller's colour (`onlyColorItsControllerChose`).

const TEXT =
  "Each player chooses a color. Then exile each permanent unless it's colorless or it's only the color its controller chose.";

export default defineCard({
  name: "Selective Obliteration",
  manaCost: "{3}{C}{C}",
  colors: [],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        startingWith: "active-player",
        for: { options: ["White", "Blue", "Black", "Red", "Green"] },
      },
      {
        kind: "exile-all",
        filter: {
          not: { anyOf: [{ colorless: true }, { onlyColorItsControllerChose: ["W", "U", "B", "R", "G"] }] },
        },
      },
    ],
  },
});
