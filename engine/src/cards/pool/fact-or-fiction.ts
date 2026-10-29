import { defineCard } from "../define.js";

// You choose the opponent who separates (as for any "an opponent" of yours),
// they separate the revealed cards (rule 700.3), and you choose the pile for
// your hand.

const TEXT =
  "Reveal the top five cards of your library. An opponent separates those cards into two piles. Put one pile into your hand and the other into your graveyard.";

export default defineCard({
  name: "Fact or Fiction",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "choose-opponent",
    then: {
      kind: "separate-into-piles",
      objects: { libraryTop: 5, reveal: true },
      separator: "that-player",
      chooser: "you",
      chosen: "hand",
      rest: "graveyard",
    },
  },
});
