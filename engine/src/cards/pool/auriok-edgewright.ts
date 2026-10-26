import { defineCard } from "../define.js";

// EDHREC rank 26166.
//
// Rulings:
//   [2011-01-01] If Auriok Edgewright has double strike as the combat damage step begins, there
//     will be a second combat damage step. As that second combat damage step begins, if Auriok
//     Edgewright no longer has double strike (perhaps because an artifact creature you controlled
//     was destroyed), Auriok Edgewright will not assign combat damage a second time.

export default defineCard({
  name: "Auriok Edgewright",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Metalcraft — This creature has double strike as long as you control three or more artifacts.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "metalcraft" },
      grantKeywords: ["double-strike"],
      text: "Metalcraft — This creature has double strike as long as you control three or more artifacts.",
    },
  ],
});
