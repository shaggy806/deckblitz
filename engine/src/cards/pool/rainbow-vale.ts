import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 13338.
//
// Rulings:
//   [2004-10-04] Only changes controller at the end of a turn in which it was tapped for mana.
//   [2007-09-16] The opponent is chosen when the "at end of turn" triggered ability resolves.
//   [2007-09-16] If control of Rainbow Vale has somehow changed before the "at end of turn"
//     ability resolves, the player who activated the mana ability (not the current controller of
//     Rainbow Vale) chooses one of their opponents to gain control of it.
//   [2007-09-16] If its ability is activated during an End step, its trigger won't trigger until
//     the End step of the next turn.
//
// The delayed trigger is part of the mana ability (`also`), so it's set up as the mana is added,
// with the activating player as its controller: they choose the opponent as it resolves
// (`choose-opponent`), and that opponent gains control of the land for good. A Vale that has
// left the battlefield since is a new object (rule 400.7) and stays put.
const TEXT =
  "{T}: Add one mana of any color. An opponent gains control of this land at the beginning of the next end step.";

export default defineCard({
  name: "Rainbow Vale",
  colors: [],
  types: ["land"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        also: {
          kind: "delayed-trigger",
          at: "next-end-step",
          text: "An opponent gains control of Rainbow Vale.",
          effect: {
            kind: "choose-opponent",
            then: { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "that-player" },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
