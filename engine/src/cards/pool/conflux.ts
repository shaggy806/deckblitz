import { defineCard } from "../define.js";

// One card per colour, any of them free to go unfound; a multicoloured card
// may fill any slot of a colour it has (the rulings) — Lotuslight Dancers'
// `oneEach`.
export default defineCard({
  name: "Conflux",
  manaCost: "{3}{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["sorcery"],
  text: "Search your library for a white card, a blue card, a black card, a red card, and a green card. Reveal those cards, put them into your hand, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }, { colors: ["G"] }] },
    destination: "hand",
    min: 0,
    max: 5,
    reveal: true,
    together: {
      oneEach: [
        { label: "a white card", filter: { colors: ["W"] } },
        { label: "a blue card", filter: { colors: ["U"] } },
        { label: "a black card", filter: { colors: ["B"] } },
        { label: "a red card", filter: { colors: ["R"] } },
        { label: "a green card", filter: { colors: ["G"] } },
      ],
    },
  },
});
