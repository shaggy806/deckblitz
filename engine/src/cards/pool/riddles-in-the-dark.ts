import { defineCard } from "../define.js";

// Curator of Destinies' shape: either pile may be empty (its ruling).
export default defineCard({
  name: "Riddles in the Dark",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Look at the top four cards of your library and separate them into a face-down pile and a face-up pile. An opponent chooses one of the piles. Put that pile into your hand and the other into your graveyard.",
  effect: {
    kind: "separate-into-piles",
    objects: { libraryTop: 4 },
    faceDown: true,
    chooser: "an-opponent",
    chosen: "hand",
    rest: "graveyard",
  },
});
