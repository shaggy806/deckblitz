import { defineCard } from "../define.js";

export default defineCard({
  name: "Madblind Mountain",
  colors: [],
  types: ["land"],
  subtypes: ["Mountain"],
  text: "({T}: Add {R}.)\nThis land enters tapped.\n{R}, {T}: Shuffle your library. Activate only if you control two or more red permanents.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
    {
      cost: { mana: "{R}", tap: true },
      condition: { kind: "controls", filter: { colors: ["R"] }, atLeast: 2 },
      targets: [],
      effect: { kind: "shuffle-library" },
      resolve: null,
      text: "{R}, {T}: Shuffle your library. Activate only if you control two or more red permanents.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
