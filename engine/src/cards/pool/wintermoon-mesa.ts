import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 27521.

export default defineCard({
  name: "Wintermoon Mesa",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {C}.\n{2}, {T}, Sacrifice this land: Tap two target lands.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: ["land", { kind: "other", of: "land", than: { slots: [0] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
        ],
      },
      resolve: null,
      text: "{2}, {T}, Sacrifice this land: Tap two target lands.",
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
