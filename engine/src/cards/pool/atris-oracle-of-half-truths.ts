import { defineCard } from "../define.js";


export default defineCard({
  name: "Atris, Oracle of Half-Truths",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 2,
  keywords: ["menace"],
  text: "Menace\nWhen Atris enters, target opponent looks at the top three cards of your library and separates them into a face-down pile and a face-up pile. Put one pile into your hand and the other into your graveyard.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "separate-into-piles",
        objects: { libraryTop: 3 },
        faceDown: true,
        separator: { target: 0 },
        chooser: "you",
        chosen: "hand",
        rest: "graveyard",
      },
      resolve: null,
      text: "When Atris enters, target opponent looks at the top three cards of your library and separates them into a face-down pile and a face-up pile. Put one pile into your hand and the other into your graveyard.",
    },
  ],
});
