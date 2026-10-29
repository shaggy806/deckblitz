import { defineCard } from "../define.js";

// You look and separate; the face-down pile is yours alone to see, the
// face-up pile everyone's (rule 700.3). The opponent you choose chooses a
// pile without seeing the face-down one.

const ETB_TEXT =
  "When this creature enters, look at the top five cards of your library and separate them into a face-down pile and a face-up pile. An opponent chooses one of those piles. Put that pile into your hand and the other into your graveyard.";

export default defineCard({
  name: "Curator of Destinies",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  cantBeCountered: true,
  text: `This spell can't be countered.\nFlying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-opponent",
        then: {
          kind: "separate-into-piles",
          objects: { libraryTop: 5 },
          faceDown: true,
          chooser: "that-player",
          chosen: "hand",
          rest: "graveyard",
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
