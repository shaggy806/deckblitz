import { defineCard } from "../define.js";

// EDHREC rank 5942. "Play": a land card exiled this way may be played, with
// a land drop and a land's timing; the rest follow their own timing and costs,
// mana of any type paying (the rulings).
export default defineCard({
  name: "Heartless Conscription",
  manaCost: "{6}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile all creatures. For each card exiled this way, you may play that card for as long as it remains exiled, and mana of any type can be spent to cast that spell. Exile Heartless Conscription.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: { type: "creature" } },
      { kind: "grant-play", cards: { thisWay: "exiled" }, duration: "while-exiled", play: true, spendAs: "any-type" },
    ],
  },
  exileOnResolve: true,
});
