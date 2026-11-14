import { defineCard } from "../define.js";

// EDHREC rank 9641.
//
// Rulings:
//   For each nonland permanent, any player may be randomly chosen, including the permanent's
//   current controller.
//   Each nonland permanent will untap, no matter which player was randomly chosen to gain control
//   of it.
//   All of the control-change effects happen at the same time.
//
// `gain-control-all` with `who: "random"`: a player drawn for each nonland permanent (each token
// of a stack its own), then every change at once (rule 613.7b). Each permanent gets a control
// effect, its controller's too, so "those permanents" is `thisWay: "control-effect"`.

const TEXT =
  "For each nonland permanent, choose a player at random. Then each player gains control of each permanent for which they were chosen. Untap those permanents.";

export default defineCard({
  name: "Scrambleverse",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control-all", filter: { notTypes: ["land"] }, untilEndOfTurn: false, who: "random" },
      { kind: "untap-all", filter: { thisWay: "control-effect" } },
    ],
  },
});
