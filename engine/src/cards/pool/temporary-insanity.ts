import { defineCard } from "../define.js";

export default defineCard({
  name: "Temporary Insanity",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Untap target creature with power less than the number of cards in your graveyard and gain control of it until end of turn. That creature gains haste until end of turn.",
  targets: [
    {
      kind: "permanent",
      filter: { type: "creature", power: { op: "lt", n: { amount: { graveyardSize: "you" } } } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
