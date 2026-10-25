import { defineCard } from "../define.js";

// EDHREC rank 11243. Great Oak Guardian's `controlledByTarget`: the filter's
// "you" is the target player.

export default defineCard({
  name: "Early Harvest",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target player untaps all basic lands they control.",
  targets: ["player"],
  effect: {
    kind: "untap-all",
    filter: { type: "land", supertype: "basic", controlledBy: "you" },
    controlledByTarget: 0,
  },
});
