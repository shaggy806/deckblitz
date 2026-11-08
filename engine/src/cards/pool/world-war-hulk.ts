import { defineCard } from "../define.js";

export default defineCard({
  name: "World War Hulk",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI — The next red or green creature spell you cast this turn can be cast without paying its mana cost.\nII — Put three +1/+1 counters on target creature you control.\nIII — Choose target creature you control. Until end of turn, double its power and toughness and it gains trample.",
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "grant-spells-this-turn",
        next: true,
        free: true,
        filter: { type: "creature", anyOf: [{ colors: ["R"] }, { colors: ["G"] }] },
      },
      resolve: null,
      text: "I — The next red or green creature spell you cast this turn can be cast without paying its mana cost.",
    },
    {
      at: [2],
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
      resolve: null,
      text: "II — Put three +1/+1 counters on target creature you control.",
    },
    {
      at: [3],
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: { powerOf: 0, doubling: true }, toughness: { toughnessOf: 0, doubling: true }, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "III — Choose target creature you control. Until end of turn, double its power and toughness and it gains trample.",
    },
  ],
});
