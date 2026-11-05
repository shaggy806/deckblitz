import { defineCard } from "../define.js";

// EDHREC rank 12389. Steam Augury's shape, with X plus one cards: at X = 0 one
// card is revealed and a pile is empty, which the opponent may choose (the
// ruling).

export default defineCard({
  name: "Epiphany at the Drownyard",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Reveal the top X plus one cards of your library and separate them into two piles. An opponent chooses one of those piles. Put that pile into your hand and the other into your graveyard.",
  effect: {
    kind: "separate-into-piles",
    objects: { libraryTop: { sum: ["x", 1] }, reveal: true },
    chooser: "an-opponent",
    chosen: "hand",
    rest: "graveyard",
  },
});
