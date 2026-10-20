import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 13755.
export default defineCard({
  name: "Gates of Istfell",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {W}.\n{2}{W}{U}{U}, {T}, Sacrifice this land: You gain 2 life and draw two cards.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "W", amount: 1 },
      resolve: null,
      text: "{T}: Add {W}.",
    },
    {
      cost: { mana: "{2}{W}{U}{U}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "draw", amount: 2 },
        ],
      },
      resolve: null,
      text: "{2}{W}{U}{U}, {T}, Sacrifice this land: You gain 2 life and draw two cards.",
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
