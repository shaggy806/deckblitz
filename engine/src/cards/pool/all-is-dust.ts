import { defineCard } from "../define.js";

// "Permanents that are one or more colors": a permanent with any colour at
// all — five `anyOf` branches, since a `CardFilter`'s `colors` asks for all
// of a list. Nobody chooses, and they all go at once (`sacrifice-all`).

export default defineCard({
  name: "All Is Dust",
  manaCost: "{7}",
  colors: [],
  types: ["kindred", "sorcery"],
  subtypes: ["Eldrazi"],
  text: "Each player sacrifices all permanents they control that are one or more colors.",
  effect: {
    kind: "sacrifice-all",
    who: "each-player",
    filter: {
      anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }, { colors: ["G"] }],
    },
  },
});
