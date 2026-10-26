import { defineCard } from "../define.js";

// EDHREC rank 23005.

export default defineCard({
  name: "Thoughtweft Gambit",
  manaCost: "{4}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Tap all creatures your opponents control and untap all creatures you control.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap-all", filter: { type: "creature", controlledBy: "opponent" } },
      { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
    ],
  },
});
