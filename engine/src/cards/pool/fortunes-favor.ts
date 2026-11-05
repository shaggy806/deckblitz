import { defineCard } from "../define.js";


export default defineCard({
  name: "Fortune's Favor",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target opponent looks at the top four cards of your library and separates them into a face-down pile and a face-up pile. Put one pile into your hand and the other into your graveyard.",
  targets: ["opponent"],
  effect: {
    kind: "separate-into-piles",
    objects: { libraryTop: 4 },
    faceDown: true,
    separator: { target: 0 },
    chooser: "you",
    chosen: "hand",
    rest: "graveyard",
  },
});
