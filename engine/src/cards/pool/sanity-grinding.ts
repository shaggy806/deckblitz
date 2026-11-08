import { defineCard } from "../define.js";

// The revealed cards go to the bottom before the mill is counted: the count
// reads their mana costs, wherever they went, and the opponent's library is
// another, so the order of the two changes nothing.
export default defineCard({
  name: "Sanity Grinding",
  manaCost: "{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Chroma — Reveal the top ten cards of your library. For each blue mana symbol in the mana costs of the revealed cards, target opponent mills a card. Then put the cards you revealed this way on the bottom of your library in any order.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 10,
        reveal: true,
        min: 0,
        max: 0,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      { kind: "mill", target: 0, amount: { aggregate: "sum", of: { manaSymbols: "U" }, filter: {}, in: { thisWay: "revealed" } } },
    ],
  },
});
