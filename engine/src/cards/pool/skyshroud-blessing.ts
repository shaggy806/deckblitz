import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 23173.

export default defineCard({
  name: "Skyshroud Blessing",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "All lands gain shroud until end of turn. (They can't be the targets of spells or abilities.)\nDraw a card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword-all", filter: { type: "land" }, keyword: "shroud", duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
});
