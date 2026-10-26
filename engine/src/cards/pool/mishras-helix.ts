import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 25410.
//
// Rulings:
//   [2004-10-04] You can target already tapped lands.
// Floodwater Dam's shape with X paid once.

export default defineCard({
  name: "Mishra's Helix",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: "{X}, {T}: Tap X target lands.",
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [{ kind: "any-number", of: "land", min: "x", max: "x" }],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
      resolve: null,
      text: "{X}, {T}: Tap X target lands.",
    },
  ],
});
