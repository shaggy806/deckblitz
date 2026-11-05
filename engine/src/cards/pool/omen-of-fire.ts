import { defineCard } from "../define.js";

// EDHREC rank 25743. Each player's count is read from their own side, after
// the Islands have gone.

export default defineCard({
  name: "Omen of Fire",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Return all Islands to their owners' hands. Each player sacrifices a Plains or a white permanent of their choice for each white permanent they control.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand-all", filter: { subtype: "Island" } },
      {
        kind: "sacrifice",
        who: "each-player",
        filter: { anyOf: [{ subtype: "Plains" }, { colors: ["W"] }] },
        count: { countOf: { colors: ["W"], controlledBy: "you" }, forEachPlayer: true },
      },
    ],
  },
});
