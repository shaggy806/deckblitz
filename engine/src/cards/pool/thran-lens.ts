import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] Does not prevent a spell or ability from adding color to permanents after this
//     effect is applied.
//   [2004-10-04] Does not make the permanents into artifacts. They are simply without color.

export default defineCard({
  name: "Thran Lens",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "All permanents are colorless.",
  static: [{ affects: { scope: "filter", filter: {} }, setColors: [], text: "All permanents are colorless." }],
});
