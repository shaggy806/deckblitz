import { defineCard } from "../define.js";

// "A spell that shares a card type with it" compares each card in hand with
// the countered spell (target slot 0) as it last was.
export default defineCard({
  name: "Counterlash",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. You may cast a spell that shares a card type with it from your hand without paying its mana cost.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "cast-now", from: "hand", free: true, spell: { sharesCardTypeWith: 0 } },
    ],
  },
});
