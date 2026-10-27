import { defineCard } from "../define.js";

// EDHREC rank 11898. Torment.

export default defineCard({
  name: "Insidious Dreams",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, discard X cards.\nSearch your library for X cards, then shuffle and put those cards on top in any order.",
  additionalCost: { discard: "x" },
  // "X cards", no quality: X must be found while the library has them (701.23d).
  effect: { kind: "search-library", filter: {}, destination: "library-top", min: "x", max: "x" },
});
