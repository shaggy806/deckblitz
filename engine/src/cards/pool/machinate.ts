import { defineCard } from "../define.js";

export default defineCard({
  name: "Machinate",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Look at the top X cards of your library, where X is the number of artifacts you control. Put one of those cards into your hand and the rest on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: { countOf: { type: "artifact", controlledBy: "you" } },
    min: 1,
    max: 1,
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
