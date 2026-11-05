import { defineCard } from "../define.js";


export default defineCard({
  name: "Steam Augury",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Reveal the top five cards of your library and separate them into two piles. An opponent chooses one of those piles. Put that pile into your hand and the other into your graveyard.",
  effect: {
    kind: "separate-into-piles",
    objects: { libraryTop: 5, reveal: true },
    chooser: "an-opponent",
    chosen: "hand",
    rest: "graveyard",
  },
});
