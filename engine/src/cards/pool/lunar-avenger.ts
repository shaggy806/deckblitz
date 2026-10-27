import { defineCard } from "../define.js";

// EDHREC rank 26299.
//
// Rulings:
//   [2004-12-01] You choose whether Lunar Avenger gains flying, first strike, or haste when the
//     activated ability resolves.

export default defineCard({
  name: "Lunar Avenger",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 2,
  toughness: 2,
  text: "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)\nRemove a +1/+1 counter from this creature: This creature gains your choice of flying, first strike, or haste until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Flying", effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" } },
          { text: "First strike", effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" } },
          { text: "Haste", effect: { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" } },
        ],
      },
      resolve: null,
      text: "Remove a +1/+1 counter from this creature: This creature gains your choice of flying, first strike, or haste until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", sunburst: true },
      text: "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)",
    },
  ],
});
