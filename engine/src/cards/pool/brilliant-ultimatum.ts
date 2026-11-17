import { defineCard } from "../define.js";

// The five cards are exiled face up; the opponent you choose separates them
// there (rule 700.3), and you choose the pile to play from. You play from it
// while this resolves, in any order, timing ignored (rule 608.2g), a land
// only as your land play (the rulings); whatever you don't play stays
// exiled, as does the other pile.

const TEXT =
  "Exile the top five cards of your library. An opponent separates those cards into two piles. You may play lands and cast spells from one of those piles. If you cast a spell this way, you cast it without paying its mana cost.";

export default defineCard({
  name: "Brilliant Ultimatum",
  manaCost: "{W}{W}{U}{U}{U}{B}{B}",
  colors: ["W", "U", "B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-from-library", amount: 5 },
      {
        kind: "separate-into-piles",
        objects: { thisWay: "exiled" },
        separator: "an-opponent",
        chooser: "you",
        chosen: {
          together: { kind: "cast-now", from: "targets", play: true, free: true, repeat: true },
          word: "play-free",
        },
      },
    ],
  },
});
