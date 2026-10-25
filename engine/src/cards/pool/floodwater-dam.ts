import { defineCard } from "../define.js";

// Alliances (ALL). EDHREC rank 30804.
//
// Candelabra of Tawnos' shape, with X paid twice.

export default defineCard({
  name: "Floodwater Dam",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{X}{X}{1}, {T}: Tap X target lands.",
  activated: [
    {
      cost: { mana: "{X}{X}{1}", tap: true },
      targets: [{ kind: "any-number", of: "land", min: "x", max: "x" }],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
      resolve: null,
      text: "{X}{X}{1}, {T}: Tap X target lands.",
    },
  ],
});
